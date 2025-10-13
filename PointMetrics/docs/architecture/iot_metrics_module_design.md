# IoT Metrics Aggregation Module - Architecture & Design

## Executive Summary
A **batch-based metrics aggregation system** that processes raw IoT sensor data into pre-computed KPIs at 15-minute intervals. Supports 100 tenants, ~250K samples/day per system, with scheduled computation and on-demand execution.

---

## 1. System Architecture

### 1.1 High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Raw Data Source (SQL DimTable + FactTable)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │ 15-Minute Batch Window             │
        │ (Scheduler: every 15min @ :00, :15, :30, :45)
        └────────────────┬───────────────────┘
                         │
        ┌────────────────▼──────────────────────────┐
        │ Metrics Computation Engine                │
        │ • Base KPIs (count, mean, median, etc)    │
        │ • Behavior KPIs (flatline, outliers)      │
        │ • Distribution KPIs (stddev, skew, etc)   │
        │ • Trend KPIs (slope, drift, momentum)     │
        │ • ML (k-means clustering, anomaly label)  │
        └────────────────┬──────────────────────────┘
                         │
        ┌────────────────▼──────────────────────────┐
        │ Metrics Storage Layer                     │
        │ • MetricsDim (dimensional lookup)         │
        │ • MetricsFact (time-bucketed KPI values)  │
        │ • Partitioned by TimeBucket (pg_partman)  │
        └────────────────┬──────────────────────────┘
                         │
        ┌────────────────▼──────────────────────────┐
        │ Query & Reporting Layer                   │
        │ • Fast retrieval for dashboards           │
        │ • Anomaly alerts & ML insights            │
        └────────────────────────────────────────────┘
```

### 1.2 Module Components

| Component | Purpose | Technology |
|-----------|---------|-----------|
| **DataLoader** | Fetch raw data from DimTable + FactTable | SQLAlchemy, pandas |
| **WindowBuffer** | Group samples into 15-min buckets | pandas groupby |
| **MetricsCompute** | Compute 25+ KPIs per bucket | numpy, scipy, scikit-learn |
| **MLPipeline** | Clustering, drift detection, anomaly labeling | scikit-learn |
| **StorageAdapter** | Write to MetricsDim + MetricsFact | SQLAlchemy, pg_partman |
| **Scheduler** | Trigger batch jobs every 15min + on-demand | APScheduler or Celery |
| **ConfigManager** | Tenant config, expected sample counts | JSON/YAML loader |

---

## 2. Data Model

### 2.1 Source Tables (Existing)

**DimTable** (sensors/points)
```sql
CREATE TABLE dim_sensor (
    sid INT PRIMARY KEY,
    tid VARCHAR(255),  -- tenant ID
    ObjectInstance VARCHAR(255),
    ObjectType VARCHAR(100),
    ObjectName VARCHAR(255),
    ObjectDescription TEXT,
    ObjectStatus VARCHAR(50),
    expected_daily_count INT,  -- samples/day config
    created_at TIMESTAMP
);
```

**FactTable** (raw samples)
```sql
CREATE TABLE fact_sample (
    sample_id BIGSERIAL PRIMARY KEY,
    sid INT REFERENCES dim_sensor(sid),
    tid VARCHAR(255),
    Timestamp TIMESTAMP NOT NULL,
    PresentValue FLOAT,
    created_at TIMESTAMP,
    INDEX (sid, tid, Timestamp)
);
```

### 2.2 Metrics Tables (New)

**MetricsDim** (lookup for metrics)
```sql
CREATE TABLE metrics_dim (
    metric_id SERIAL PRIMARY KEY,
    tid VARCHAR(255),
    sid INT,
    metric_name VARCHAR(100),  -- 'Actual_Mean', 'Flatline_Pct', etc.
    metric_category VARCHAR(50),  -- 'Base', 'Behavior', 'Distribution', 'Trend'
    unit VARCHAR(50),  -- e.g., '%', '°C', 'count'
    description TEXT,
    UNIQUE (tid, sid, metric_name)
);
```

**MetricsFact** (time-bucketed KPI values) — PARTITIONED BY time_bucket
```sql
CREATE TABLE metrics_fact (
    metric_fact_id BIGSERIAL,
    tid VARCHAR(255) NOT NULL,
    sid INT NOT NULL,
    metric_id INT NOT NULL REFERENCES metrics_dim(metric_id),
    YearNumber INT NOT NULL,
    DayNumber INT NOT NULL,  -- day of year (1-366)
    TimeBucketNo INT NOT NULL,  -- bucket in day (0-95 for 15-min buckets)
    metric_value FLOAT,
    computed_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (tid, YearNumber, DayNumber, TimeBucketNo, metric_id)
) PARTITION BY RANGE (YearNumber, DayNumber);
-- Use pg_partman to auto-create partitions (daily or weekly)
```

**Alternative: Parquet for Cold Storage**
- Post-compute to Parquet for long-term archive (S3, data lake)
- Keep hot data (last 30 days) in PostgreSQL
- Compress & partition by `year/month/tid/sid`

### 2.3 Key Indexing Strategy
```sql
-- Fast lookups for sensor metrics
CREATE INDEX idx_metrics_fact_tid_sid_bucket 
ON metrics_fact (tid, sid, YearNumber, DayNumber, TimeBucketNo);

-- Fast queries for anomaly checks
CREATE INDEX idx_metrics_fact_metric_id_value 
ON metrics_fact (metric_id, metric_value) WHERE metric_value IS NOT NULL;
```

---

## 3. Computation Pipeline

### 3.1 15-Minute Batch Logic

**Trigger Schedule:**
```
Every 15 minutes at: 00:00, 00:15, 00:30, 00:45, 01:00, ...
For each completed window:
  • Fetch samples from [T-15min, T]
  • Group by (tid, sid)
  • Compute metrics for each group
  • Store results in MetricsFact
  • Run ML pipeline (clustering, anomaly detection)
```

### 3.2 KPI Computation Categories

| Category | KPIs | Complexity |
|----------|------|-----------|
| **Base** | Actual_Count, Expected_Config_Count, Expected_Hist_Count, Coverage%, Missing% | Low |
| **Behavior** | Flatline_Pct, Outlier_Count, Value_Constant | Medium |
| **Distribution** | Stddev, Variance, IQR, Skewness, Kurtosis, Percentile_95 | Medium |
| **Trend** | Slope_Trend, Drift_Score, Momentum_Trend, Rate_Change, Zscore_Max | High |
| **ML** | KMeans_Cluster_ID, Anomaly_Label | High |

### 3.3 ML Pipeline

**Clustering (K-Means):**
- Input: Normalized metrics for all points in a time bucket
- Features: `[Normalized_Count, Flatline_Pct, Outlier_Count, Stddev, Slope_Trend]`
- Output: Cluster assignment (e.g., "Normal", "Degraded", "Failed")
- Refit: Weekly or on-demand

**Anomaly Detection:**
- Compare current bucket metrics vs. historical rolling window (e.g., last 7 days)
- Flags: Drift_Score > 2σ, Coverage < threshold, Flatline_Pct > 50%
- Label: "Expected" or "Anomalous"

---

## 4. Storage Strategy

### 4.1 PostgreSQL (Hot Data)

**Retention:** Last 30–90 days (configurable)  
**Partitioning:** 
- Daily partitions for active data
- Use `pg_partman` for automatic rotation
- Archive older partitions to Parquet

```sql
-- Auto-manage via pg_partman
SELECT create_parent(
    'public.metrics_fact',
    'DayNumber',
    'RANGE',
    p_interval := 1  -- daily partition
);
```

### 4.2 Parquet (Cold Storage / Archive)

**When to Archive:**
- After 90 days, export to Parquet
- Compress with Snappy or Zstd
- Store on S3 or local filesystem

**Schema:**
```
s3://metrics-archive/
  ├── year=2025/
  │   ├── month=01/
  │   │   ├── tid=tenant-abc/
  │   │   │   ├── sid=123.parquet
  │   │   │   ├── sid=124.parquet
```

**Benefits:**
- Cost-effective long-term storage
- Queryable with DuckDB, Polars, Pandas
- Supports columnar compression

---

## 5. Scheduler Design

### 5.1 Two Execution Modes

**Mode 1: Scheduled (Automatic)**
```
Every 15 minutes:
  1. Identify completed window(s)
  2. Fetch & compute metrics
  3. Store results
  4. Trigger ML pipeline
  5. Log execution
```

**Mode 2: On-Demand (Manual)**
```
API Call: POST /metrics/compute-now
  body: {
    "tid": "tenant-xyz",
    "sid": [123, 124],  # optional; if null, compute all
    "year": 2025,
    "day_number": 100,
    "time_bucket_no": 10  # optional; if null, compute all for day
  }
```

### 5.2 Scheduler Options

| Tool | Pros | Cons |
|------|------|------|
| **APScheduler** | Simple, in-process, no external deps | Single process, not distributed |
| **Celery + Redis** | Distributed, scalable, robust | More infrastructure |
| **Airflow** | Production-grade DAGs, monitoring | Heavy for simple batches |
| **Cloud Scheduler** | Managed, simple | Vendor lock-in |

**Recommendation:** Start with **APScheduler** for MVP; upgrade to Celery if scaling.

---

## 6. Module Structure (Python)

```
iot_metrics_module/
├── config/
│   ├── __init__.py
│   └── config.py                 # Tenants, DB, thresholds
├── data/
│   ├── __init__.py
│   ├── loader.py                 # DataLoader class
│   └── models.py                 # SQLAlchemy ORM models
├── metrics/
│   ├── __init__.py
│   ├── compute.py                # MetricsCompute class
│   └── kpi_definitions.py        # KPI formulas
├── ml/
│   ├── __init__.py
│   ├── clustering.py             # K-means pipeline
│   └── anomaly.py                # Anomaly detection logic
├── storage/
│   ├── __init__.py
│   ├── postgres_adapter.py       # PostgreSQL I/O
│   └── parquet_adapter.py        # Parquet archive I/O
├── scheduler/
│   ├── __init__.py
│   └── job_scheduler.py          # APScheduler wrapper
├── api/
│   ├── __init__.py
│   └── routes.py                 # FastAPI endpoints (on-demand)
├── utils/
│   ├── __init__.py
│   ├── logger.py
│   └── helpers.py
├── main.py                       # Entry point
└── requirements.txt
```

---

## 7. Execution Flow Example

### Scenario: Compute metrics for 15-min bucket [14:00–14:15]

```
Time: 14:15:30
Trigger: APScheduler job (or manual API call)

Step 1: Load Configuration
  └─ Get tenant list, expected sample counts

Step 2: DataLoader.fetch_samples()
  └─ Query FactTable WHERE Timestamp BETWEEN 14:00 AND 14:15
  └─ Result: DataFrame(tid, sid, Timestamp, PresentValue, ...)

Step 3: GroupBy (tid, sid)
  └─ For each group, compute KPIs

Step 4: MetricsCompute.compute_all_kpis()
  └─ Base: count, mean, median, range, coverage%
  └─ Behavior: flatline%, outliers, constant check
  └─ Distribution: stddev, variance, IQR, skew, kurtosis
  └─ Trend: slope, drift, momentum, rate_change, z-score
  └─ Output: DataFrame(metric_id, metric_value, ...)

Step 5: MLPipeline.predict()
  └─ Normalize features
  └─ KMeans.predict() → Cluster ID
  └─ Anomaly detection → Label
  └─ Output: Cluster_ID, Anomaly_Label

Step 6: StorageAdapter.insert_metrics_fact()
  └─ Upsert into MetricsFact table
  └─ Partition key: (YearNumber, DayNumber)

Step 7: Log & Monitor
  └─ Log: 2025-01-15 14:15:30 | Processed 150 sensors | 3750 KPIs | 2.4s
  └─ Alert if any failures
```

---

## 8. Performance Considerations

### 8.1 Throughput Estimate

```
250K samples/day / 96 buckets/day = ~2.6K samples/bucket
Assume 100 sensors active per bucket
~26 samples per sensor per 15-min window

Compute time per bucket:
  • Data fetch: ~100ms
  • Metrics compute: ~500ms (25 KPIs × 100 sensors)
  • ML (k-means, anomaly): ~300ms
  • Storage write: ~200ms
  ─────────────────────
  Total: ~1.1s per 15-min window ✓ (well under 15min)

Memory:
  • Raw samples: 2.6K × 50 bytes = 130 KB
  • Metrics output: 2.5K × 30 bytes = 75 KB
  • Total per batch: ~200 KB ✓
```

### 8.2 Optimization Tips

1. **Parallel Processing** (per tenant or per sensor):
   ```python
   from concurrent.futures import ThreadPoolExecutor
   with ThreadPoolExecutor(max_workers=4) as pool:
       results = pool.map(compute_metrics_for_sid, sensor_ids)
   ```

2. **Vectorized Numpy Operations**: Pre-compute over 100 sensors at once

3. **Connection Pooling**: SQLAlchemy `create_engine(..., pool_size=10, max_overflow=20)`

4. **Batch Inserts**: Use `executemany()` or `COPY` for 1000+ rows at once

5. **Index Strategy**: Avoid index bloat; partition intelligently

---

## 9. Monitoring & Alerting

### 9.1 Key Metrics to Track

- **Batch latency**: Time from trigger to completion
- **Data completeness**: % of expected sensors processed
- **KPI quality**: Null rate, outlier rate
- **Anomaly rate**: % sensors flagged "Anomalous"
- **Storage growth**: MB/day in MetricsFact

### 9.2 Alerts

```
IF batch_duration > 30s THEN alert("Slow batch")
IF null_rate > 5% THEN alert("Data quality issue")
IF anomaly_rate > 20% THEN alert("System-wide anomaly")
```

---

## 10. Deployment

### 10.1 Docker Setup

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

### 10.2 Environment Variables

```bash
DB_HOST=postgres.example.com
DB_USER=metrics_user
DB_PASS=***
REDIS_URL=redis://localhost:6379  # if using Celery
LOG_LEVEL=INFO
ARCHIVE_TO_PARQUET=True
ARCHIVE_PATH=/data/metrics-archive
```

---

## 11. Next Steps

1. **Implement DataLoader** with connection pooling
2. **Implement MetricsCompute** with vectorized numpy
3. **Set up PostgreSQL** with pg_partman
4. **Build StorageAdapter** (insert + upsert logic)
5. **Add MLPipeline** (k-means + anomaly detection)
6. **Implement Scheduler** (APScheduler)
7. **Add FastAPI** for on-demand execution
8. **Test** with synthetic data (250K samples)
9. **Monitor** and optimize based on real workload