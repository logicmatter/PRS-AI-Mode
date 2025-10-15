# PointMetrics - IoT Metrics Aggregation Module

A production-grade batch processing engine for computing KPIs on time-series IoT sensor data.

## Overview

**PointMetrics** (IMAE - IoT Metrics Aggregation Engine) processes raw IoT sensor data into pre-computed KPIs at 15-minute intervals, supporting 100+ tenants and ~250K samples/day per system.

### Key Features

- Γ£à 15-minute batch processing (scheduled and on-demand)
- Γ£à 25+ KPIs (Base, Behavior, Distribution, Trend metrics)
- Γ£à ML Integration (K-means clustering, anomaly detection)
- Γ£à Multi-tenant support (100+ concurrent tenants)
- Γ£à Parquet-first storage (fast columnar with partitioning)
- Γ£à Production-ready (monitoring, logging, alerting)

## Quick Start

### Installation

```bash
# Create virtual environment
python -m venv venv
venv\\Scripts\\activate  # Windows

# Install dependencies
pip install -r requirements.txt
pip install -e .
```

### Configuration

```bash
# Copy and edit environment file
copy .env.example .env
# Edit .env with your settings
```

### Running

```bash
# Start the service
python src/iot_metrics_module/main.py
# or
imae
```

## Project Structure

```
PointMetrics/
Γö£ΓöÇΓöÇ src/iot_metrics_module/  # Source code
Γöé   Γö£ΓöÇΓöÇ config/              # Configuration
Γöé   Γö£ΓöÇΓöÇ data/                # Data models and loading
Γöé   Γö£ΓöÇΓöÇ metrics/             # KPI computation
Γöé   Γö£ΓöÇΓöÇ ml/                  # Machine learning
Γöé   Γö£ΓöÇΓöÇ storage/             # Parquet storage
Γöé   Γö£ΓöÇΓöÇ scheduler/           # Job scheduling
Γöé   Γö£ΓöÇΓöÇ api/                 # REST API
Γöé   ΓööΓöÇΓöÇ utils/               # Utilities
Γö£ΓöÇΓöÇ tests/                   # Test suites
Γö£ΓöÇΓöÇ scripts/                 # Utility scripts
Γö£ΓöÇΓöÇ docs/                    # Documentation
Γö£ΓöÇΓöÇ docker/                  # Containers
ΓööΓöÇΓöÇ monitoring/              # Monitoring setup
```

## Development

### Running Tests
```bash
pytest tests/ -v --cov=src/iot_metrics_module
```

### Code Quality
```bash
black src/ tests/      # Format
flake8 src/ tests/     # Lint
mypy src/              # Type check
```

## Documentation

- [Architecture Design](docs/architecture/iot_metrics_module_design.md)
- [Parquet Storage](docs/parquet-refactoring.md)
- [Development Roadmap](docs/next-steps.md)
- [AI Assistant Guide](CLAUDE.md)

## Performance Targets

- **Throughput:** ~2.6K samples per 15-min bucket
- **Processing Time:** <2s per bucket (100 sensors)
- **Memory:** ~200KB per batch
- **Scale:** 100+ tenants, ~250K samples/day

## Current Status

**Phase 1 - Core Implementation**

Completed:
- Γ£à Project structure
- Γ£à Parquet storage architecture
- Γ£à Data models (Pydantic)
- Γ£à Metrics computation framework
- Γ£à Storage adapter
- Γ£à Synthetic data generator

In Progress:
- ≡ƒöä ML pipeline
- ≡ƒöä API endpoints
- ≡ƒöä Test coverage

## License

MIT License - See [LICENSE](LICENSE)
