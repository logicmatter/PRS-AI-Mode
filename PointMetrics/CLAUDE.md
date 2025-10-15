# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PointMetrics** is an IoT Metrics Aggregation Module (IMAE) for building monitoring analytics. It's a batch-based metrics aggregation system that processes raw IoT sensor data into pre-computed KPIs at 15-minute intervals. The system supports 100+ tenants processing ~250K samples/day, with both scheduled and on-demand execution.

**Important Context:** The project has recently been refactored from PostgreSQL to a Parquet-first storage architecture. See `docs/parquet-refactoring.md` for details.

## Architecture Overview

### High-Level Data Flow
```
Raw Data (Parquet files) → 15-Min Batch Window → Metrics Computation Engine (25+ KPIs)
→ ML Pipeline (Clustering + Anomaly) → Storage (Parquet partitioned files) → API/Reporting
```

### Core Components

1. **DataLoader** (`src/iot_metrics_module/data/loader.py`) - Loads raw sensor data and metadata from Parquet files
2. **MetricsCompute** (`src/iot_metrics_module/metrics/compute.py`) - Computes 25+ KPIs per time bucket
3. **ParquetStorageAdapter** (`src/iot_metrics_module/storage/parquet_adapter.py`) - Unified storage for all data types
4. **MLPipeline** (`src/iot_metrics_module/ml/`) - K-means clustering and anomaly detection
5. **JobScheduler** (`src/iot_metrics_module/scheduler/job_scheduler.py`) - APScheduler-based job execution
6. **API** (`src/iot_metrics_module/api/routes.py`) - FastAPI endpoints for on-demand computation

### Storage Architecture (Parquet-First)

The system uses a hierarchical Parquet file structure:

```
{base_path}/
├── metrics/year=YYYY/month=MM/tid=XXX/day=DDD/metrics.parquet
├── samples/year=YYYY/month=MM/tid=XXX/samples.parquet
├── sensors/sensors.parquet
├── logs/year=YYYY/month=MM/computation_logs.parquet
├── ml_models/{model_type}_versions.parquet
└── config/tenant_configs.parquet
```

**Key Design Decisions:**
- Parquet files provide compression, columnar efficiency, and eliminate database dependencies
- Partitioned by `year/month/tenant/day` for fast bucket lookups
- No ACID transactions - uses file-level operations with deduplication logic
- Can add DuckDB query layer later for SQL access without data migration

## Development Commands

### Project Initialization (First Time)
```bash
# If bmad-project structure doesn't exist yet, run scaffolding tool
python bmad-init.py  # Creates complete project structure

# Note: This will create/overwrite the bmad-project directory
# Use --name flag to specify different directory name
python bmad-init.py --name my-custom-name
```

### Setup and Installation
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install package in development mode
pip install -e .
```

### Running the Application
```bash
# Start the main service (scheduler + API)
python src/iot_metrics_module/main.py

# Or use the entry point
imae
```

### Testing
```bash
# Run all tests with coverage
pytest tests/ -v --cov=src/iot_metrics_module --cov-report=html

# Run specific test file
pytest tests/unit/test_metrics_compute.py -v

# Run tests for specific module
pytest tests/unit/test_parquet_storage.py -v

# Run integration tests only
pytest tests/integration/ -v
```

### Code Quality
```bash
# Format code with black
black src/ tests/

# Sort imports
isort src/ tests/

# Run linter
flake8 src/ tests/

# Type checking
mypy src/

# Run all quality checks at once (if Makefile exists)
make format  # Format code
make lint    # Run linters
make test    # Run tests
```

### Generating Test Data
```python
# Use the built-in synthetic data generator
from src.iot_metrics_module.data.loader import SyntheticDataGenerator
from src.iot_metrics_module.storage.parquet_adapter import ParquetStorageAdapter
from src.iot_metrics_module.config.config import get_config

config = get_config()
storage = ParquetStorageAdapter(config)
gen = SyntheticDataGenerator(storage)

# Generate complete dataset (sensors + samples)
sensors, samples = gen.generate_complete_dataset(
    tid="test-tenant",
    num_sensors=10,
    days=1,
    sample_interval_minutes=1
)
```

## Key Architectural Patterns

### Time Bucket System
The system operates on a time-bucketing scheme:
- 15-minute buckets (configurable)
- 96 buckets per day (24 hours * 4 buckets/hour)
- Buckets identified by: `(year, day_number, time_bucket_no)`
- Helper functions in `src/iot_metrics_module/data/models.py`:
  - `timestamp_to_bucket()` - Convert timestamp to bucket coordinates
  - `get_bucket_timestamp()` - Convert bucket coordinates to timestamp
  - `validate_time_bucket()` - Validate bucket coordinates

### Data Models (Pydantic-Based)
All data models use Pydantic for validation (NOT SQLAlchemy). Defined in `src/iot_metrics_module/data/models.py`:
- `DimSensor` - Sensor metadata (sid, tid, ObjectInstance, ObjectType, expected_daily_count)
- `FactSample` - Raw sensor readings (sample_id, sid, tid, Timestamp, PresentValue)
- `MetricValue` - Computed metrics (tid, sid, metric_name, metric_value, year, day_number, time_bucket_no)
- `ComputationLog` - Execution tracking (execution_type, year, day_number, time_bucket_no, status, started_at, completed_at)
- `MLModelVersion` - ML model versioning (model_type, version, is_active, trained_at)
- `TenantConfig` - Per-tenant configuration (tid, name, enabled, expected_daily_samples)

### KPI Categories
Metrics are organized into categories:
1. **Base** - Count, mean, median, coverage%, missing%
2. **Behavior** - Flatline detection, outlier detection, constant value checks
3. **Distribution** - Stddev, variance, IQR, skewness, kurtosis
4. **Trend** - Slope, drift score, momentum, rate of change, z-score
5. **ML** - K-means cluster ID, anomaly labels

### Parallel Processing
- MetricsCompute supports parallel sensor processing via ThreadPoolExecutor
- Configured via `config.parallel_processing` and `config.max_workers`
- Use for batches with many sensors (>100)

## Configuration

Configuration uses Pydantic Settings with environment variables:

```bash
# Parquet Storage (Required)
STORAGE_PARQUET_PATH=/data/pointmetrics
STORAGE_PARQUET_COMPRESSION=snappy

# Processing Settings
METRICS_BUCKET_INTERVAL_MINUTES=15
METRICS_ENABLE_ML_METRICS=true
PARALLEL_PROCESSING=true
MAX_WORKERS=4

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
API_LOG_LEVEL=info

# Scheduler Settings
SCHEDULER_ENABLE_SCHEDULED_JOBS=true
SCHEDULER_CRON_SCHEDULE="*/15 * * * *"  # Every 15 minutes
```

## Important Implementation Notes

### When Modifying Storage Logic
- Always partition by time dimensions (year, month, day)
- Include tenant ID (tid) in partition path
- Use deduplication logic when appending to existing files
- Handle missing files gracefully (return empty DataFrame)
- Test with multiple tenants and time ranges

### When Adding New KPIs
1. Define KPI in `src/iot_metrics_module/metrics/kpi_definitions.py`
2. Add compute function that takes `(values: np.ndarray, context: dict)`
3. Specify category, unit, and description
4. Add to KPI registry
5. Update tests in `tests/unit/test_kpi_definitions.py`

### When Working with Time Buckets
- Always use helper functions from `models.py` for conversions
- Buckets are 0-indexed (0-95 for 15-minute buckets)
- Day numbers are 1-indexed (1-366)
- Use UTC timestamps consistently

### ML Pipeline Considerations
- Clustering uses normalized metric features
- Models are versioned and stored in Parquet
- Anomaly detection compares current vs historical (last 7 days)
- Retraining should be scheduled separately (weekly recommended)

## File Organization

### Core Modules
- `src/iot_metrics_module/main.py` - Main orchestration engine and entry point
- `src/iot_metrics_module/config/config.py` - Configuration management
- `src/iot_metrics_module/data/loader.py` - Data loading from Parquet
- `src/iot_metrics_module/data/models.py` - Pydantic data models
- `src/iot_metrics_module/metrics/compute.py` - KPI computation engine
- `src/iot_metrics_module/metrics/kpi_definitions.py` - KPI registry and definitions
- `src/iot_metrics_module/storage/parquet_adapter.py` - Unified Parquet storage

### Utility Modules
- `src/iot_metrics_module/utils/logger.py` - Structured logging
- `src/iot_metrics_module/utils/helpers.py` - Helper functions

### Scripts and Tools
- `bmad-init.py` - **Project scaffolding tool** - Generates complete project structure, directories, and template files. Run this first on new installations.
- `scripts/init_database.py` - Database initialization (legacy, pre-Parquet)
- `scripts/generate_sample_data.py` - Sample data generation script

### Documentation
- `docs/architecture/iot_metrics_module_design.md` - Complete system design
- `docs/specifications/pmmetrics_bmad_analogy.md` - Architecture patterns
- `docs/parquet-refactoring.md` - Storage refactoring details
- `docs/next-steps.md` - Development roadmap

## Common Development Tasks

### Adding a New Tenant
```python
from src.iot_metrics_module.data.models import TenantConfig
from src.iot_metrics_module.storage.parquet_adapter import ParquetStorageAdapter

config = get_config()
storage = ParquetStorageAdapter(config)

tenant = TenantConfig(
    tid="new-tenant",
    name="New Tenant Name",
    enabled=True,
    expected_daily_samples=100000,
    bucket_interval_minutes=15
)

storage.write_tenant_config(tenant)
```

### Computing Metrics On-Demand
```python
# Via API
POST /api/v1/compute
{
    "year": 2025,
    "day_number": 100,
    "time_bucket_no": 10,
    "tid": "tenant-id",  # optional
    "sids": [123, 124]   # optional
}

# Programmatically
from src.iot_metrics_module.main import MetricsComputeEngine

engine = MetricsComputeEngine()
result = engine.compute_and_store(
    year=2025,
    day_number=100,
    time_bucket_no=10,
    tid="tenant-id",
    execution_type='on-demand'
)
```

### Querying Stored Metrics
```python
from src.iot_metrics_module.storage.parquet_adapter import ParquetStorageAdapter

storage = ParquetStorageAdapter(config)

# Query metrics for specific day
metrics_df = storage.read_metrics(
    tid="tenant-id",
    year=2025,
    month=10,
    day_number=287
)

# Query specific metrics
metrics_df = storage.read_metrics(
    tid="tenant-id",
    year=2025,
    month=10,
    metric_names=["Actual_Count", "Flatline_Pct"]
)
```

### Accessing Computation Logs
```python
# Read recent logs
logs = storage.read_computation_logs(year=2025, limit=100)

# Filter by status
failed_logs = storage.read_computation_logs(status='failed', limit=50)
```

## Testing Strategy

### Unit Tests
- Test individual KPI calculations with known inputs
- Mock storage layer for metrics compute tests
- Test data model validation
- Test helper functions and utilities

### Integration Tests
- Test full pipeline: generate data → compute → store → query
- Test multi-tenant scenarios
- Test time range queries across partitions
- Test parallel processing with multiple sensors

### Performance Tests
- Verify batch processing completes in <2s for 100 sensors
- Test with realistic data volumes (250K samples/day)
- Monitor memory usage during processing

## Troubleshooting

### Common Issues

**Problem:** "No samples found for bucket"
- Check that raw sample data exists for the time range
- Verify tenant ID and sensor IDs are correct
- Check Parquet file paths match expected structure

**Problem:** "High percentage of null values in metrics"
- Check that raw samples have valid PresentValue data
- Verify KPI computation functions handle edge cases
- Check for insufficient data in time bucket

**Problem:** "Duplicate metrics detected"
- This is expected behavior - deduplication happens on write
- Check that deduplication logic in parquet_adapter.py is working
- Verify unique key: (tid, sid, year, day_number, time_bucket_no, metric_name)

**Problem:** "Storage path not found"
- Ensure STORAGE_PARQUET_PATH is set correctly
- Check directory permissions
- Run storage initialization to create directory structure

## Performance Optimization Tips

1. **Use batch writes** - Write 100s-1000s of rows at once, not individual rows
2. **Leverage partitioning** - Always filter by partition columns (year, month, tid)
3. **Enable parallel processing** - Set `PARALLEL_PROCESSING=true` for multi-sensor batches
4. **Choose compression wisely** - Use `snappy` (default) for balanced speed/size
5. **Avoid full table scans** - Query specific partitions rather than entire dataset
6. **Monitor file growth** - Use `storage.cleanup_old_data()` to remove old partitions

## Project Context

This system is inspired by PMMetrics, a device monitoring application using Flask + Bootstrap + Jinja2. The architectural patterns are similar:
- PMMetrics processes device timeseries into 15-minute statistical buckets
- PointMetrics processes sensor timeseries into 15-minute KPI buckets
- Both use configuration-driven architecture with modular backend services

The project also follows patterns from the BMAD (particle accelerator) framework analogy - treating data processing like beam processing through lattice elements.

## Current Development Status

**Completed:**
- Project structure and scaffolding
- Parquet-first storage refactoring
- Data models (Pydantic-based)
- Core metrics computation framework
- Storage adapter with full CRUD operations
- Synthetic data generator

**In Progress:**
- ML pipeline implementation (clustering, anomaly detection)
- API endpoint implementation
- Comprehensive test coverage
- Documentation completion

**Next Priorities:**
1. Complete ML pipeline testing
2. Add integration tests for full data flow
3. Implement API authentication
4. Add monitoring/alerting capabilities
5. Performance optimization and profiling

## Additional Resources

- Architecture design: `docs/architecture/iot_metrics_module_design.md`
- Parquet refactoring details: `docs/parquet-refactoring.md`
- Development roadmap: `docs/next-steps.md`
- Original README: `README.md` (contains setup instructions)

## Code Standards (from CONTRIBUTING.md)

- Follow PEP 8 style guide
- Write docstrings for all functions and classes
- Add type hints to function signatures
- Maintain test coverage above 85%
- Use conventional commit format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation updates
  - `test:` for test additions
  - `refactor:` for code refactoring

## Notes for AI Assistants

- The system recently migrated from PostgreSQL to Parquet - do NOT reference SQLAlchemy or database connections
- Always use the ParquetStorageAdapter for all storage operations
- Time bucket calculations are critical - use the provided helper functions
- Test with synthetic data before using production data
- Follow the existing patterns for consistency (see pmmetrics_bmad_analogy.md)
- Maintain the partition structure when writing new data
- Document new KPIs thoroughly with units and descriptions
- The `bmad-init.py` script is a project scaffolding tool - it generates the complete directory structure and template files
- Howto switch models between Sonet for development and Opus for Planning