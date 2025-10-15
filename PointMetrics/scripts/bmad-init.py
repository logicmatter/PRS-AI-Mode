#!/usr/bin/env python3
"""
BMAD Project Structure Generator
Creates complete project structure for IoT Metrics Aggregation Module
"""

import os
import sys
from pathlib import Path
from typing import Dict, List

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text: str):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text:^60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")

def print_success(text: str):
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")

def print_info(text: str):
    print(f"{Colors.OKCYAN}→ {text}{Colors.ENDC}")

def print_warning(text: str):
    print(f"{Colors.WARNING}⚠ {text}{Colors.ENDC}")

def print_error(text: str):
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")

# Project structure definition
PROJECT_STRUCTURE = {
    "docs": {
        "specifications": {},
        "architecture": {},
        "api": {},
    },
    "src": {
        "iot_metrics_module": {
            "config": {},
            "data": {},
            "metrics": {},
            "ml": {},
            "storage": {},
            "scheduler": {},
            "api": {},
            "utils": {},
        }
    },
    "tests": {
        "unit": {},
        "integration": {},
        "fixtures": {},
    },
    "docker": {},
    "scripts": {},
    "monitoring": {
        "prometheus": {},
        "grafana": {
            "dashboards": {},
        },
    },
}

# File templates
TEMPLATES = {
    "README.md": """# BMAD - Building Monitoring Analytics & Diagnostics

## IoT Metrics Aggregation Module (IMAE)

A production-grade batch processing engine for computing KPIs on time-series IoT sensor data.

### Features

- ✅ **15-minute batch processing** - Scheduled and on-demand execution
- ✅ **25+ KPIs** - Base, Behavior, Distribution, and Trend metrics
- ✅ **ML Integration** - K-means clustering and anomaly detection
- ✅ **Multi-tenant** - Supports 100+ concurrent tenants
- ✅ **Scalable storage** - PostgreSQL (hot) + Parquet (cold archive)
- ✅ **Production-ready** - Monitoring, logging, alerting, DR

### Quick Start

```bash
# Clone repository
# git clone https://github.com/yourusername/bmad-project.git
# cd bmad-project

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
alembic upgrade head

# Start the service
python src/iot_metrics_module/main.py
```

### Docker Quick Start

```bash
# Start all services (PostgreSQL, Redis, IMAE, Prometheus, Grafana)
docker-compose up -d

# View logs
docker-compose logs -f imae

# Access services
# - API: http://localhost:8000
# - Grafana: http://localhost:3000 (admin/admin)
# - Prometheus: http://localhost:9090
```

### Architecture

See [Architecture Documentation](docs/architecture/README.md) for detailed system design.

### API Documentation

Interactive API docs available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Documentation

- [Full Specification](docs/specifications/iot-metrics-aggregation-spec.md)
- [API Reference](docs/api/README.md)
- [Deployment Guide](docs/deployment/README.md)
- [Operations Runbook](docs/operations/runbook.md)

### Project Structure

```
bmad-project/
├── docs/               # Documentation
├── src/                # Source code
├── tests/              # Test suites
├── docker/             # Container configurations
├── scripts/            # Utility scripts
└── monitoring/         # Monitoring configs
```

### Development

```bash
# Run tests
pytest tests/ -v --cov=src/iot_metrics_module

# Run linter
flake8 src/

# Format code
black src/ tests/

# Type checking
mypy src/
```

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### License

MIT License - See [LICENSE](LICENSE) file for details.

### Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/bmad-project/issues
- Email: support@example.com
""",

    ".gitignore": """# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# Virtual Environment
venv/
env/
ENV/
.venv

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Testing
.pytest_cache/
.coverage
htmlcov/
.tox/

# Environment variables
.env
.env.local
.env.*.local

# Logs
*.log
logs/

# Database
*.db
*.sqlite3

# Docker
docker-compose.override.yml

# Parquet files
*.parquet

# ML Models
*.pkl
*.joblib
models/

# Jupyter
.ipynb_checkpoints/
*.ipynb

# Documentation builds
docs/_build/
site/

# OS
Thumbs.db
""",

    "requirements.txt": """# Core dependencies
pandas==2.1.4
numpy==1.26.2
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.13.0

# Scientific computing
scipy==1.11.4
scikit-learn==1.3.2

# Scheduling
apscheduler==3.10.4

# API
fastapi==0.108.0
uvicorn[standard]==0.25.0
pydantic==2.5.3
pydantic-settings==2.1.0

# Redis (optional, for Celery)
redis==5.0.1
celery==5.3.4

# Parquet support
pyarrow==14.0.1

# Monitoring
prometheus-client==0.19.0

# Logging
python-json-logger==2.0.7

# Authentication
pyjwt==2.8.0
python-multipart==0.0.6

# Testing
pytest==7.4.3
pytest-cov==4.1.0
pytest-asyncio==0.21.1

# Code quality
black==23.12.1
flake8==6.1.0
mypy==1.7.1
isort==5.13.2

# Documentation
mkdocs==1.5.3
mkdocs-material==9.5.3
""",

    ".env.example": """# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=metrics_user
DB_PASS=your_secure_password_here
DB_NAME=metrics_db

# Redis (for Celery)
REDIS_URL=redis://localhost:6379/0

# Execution Settings
BATCH_SIZE=1000
WORKERS=4
TIMEZONE=UTC

# ML Configuration
KMEANS_N_CLUSTERS=5
KMEANS_RANDOM_STATE=42

# Archival
ARCHIVE_TO_PARQUET=True
ARCHIVE_PATH=/data/metrics-archive
ARCHIVE_RETENTION_DAYS=90

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4

# Security
JWT_SECRET_KEY=change_this_to_a_secure_random_string
ALLOWED_ORIGINS=http://localhost:3000,https://app.example.com

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
GRAFANA_PASSWORD=admin
""",

    "src/iot_metrics_module/__init__.py": """\"\"\"
IoT Metrics Aggregation Module (IMAE)
Building Monitoring Analytics & Diagnostics

A production-grade system for computing KPIs on time-series IoT sensor data.
\"\"\"

__version__ = "1.0.0"
__author__ = "BMAD Team"
__license__ = "MIT"

from .main import main

__all__ = ["main"]
""",

    "src/iot_metrics_module/config/__init__.py": """\"\"\"Configuration management module\"\"\"

from .config import Config, get_config

__all__ = ["Config", "get_config"]
""",

    "src/iot_metrics_module/data/__init__.py": """\"\"\"Data loading and management module\"\"\"

from .loader import DataLoader
from .models import DimSensor, FactSample, MetricsDim, MetricsFact

__all__ = ["DataLoader", "DimSensor", "FactSample", "MetricsDim", "MetricsFact"]
""",

    "src/iot_metrics_module/metrics/__init__.py": """\"\"\"Metrics computation module\"\"\"

from .compute import MetricsCompute
from .kpi_definitions import KPI_DEFINITIONS

__all__ = ["MetricsCompute", "KPI_DEFINITIONS"]
""",

    "src/iot_metrics_module/ml/__init__.py": """\"\"\"Machine learning pipeline module\"\"\"

from .pipeline import MLPipeline
from .clustering import KMeansClusterer
from .anomaly_detection import AnomalyDetector

__all__ = ["MLPipeline", "KMeansClusterer", "AnomalyDetector"]
""",

    "src/iot_metrics_module/storage/__init__.py": """\"\"\"Storage adapters module\"\"\"

from .postgres_adapter import PostgresAdapter
from .parquet_adapter import ParquetAdapter

__all__ = ["PostgresAdapter", "ParquetAdapter"]
""",

    "src/iot_metrics_module/scheduler/__init__.py": """\"\"\"Job scheduling module\"\"\"

from .job_scheduler import JobScheduler

__all__ = ["JobScheduler"]
""",

    "src/iot_metrics_module/api/__init__.py": """\"\"\"REST API module\"\"\"

from .routes import app

__all__ = ["app"]
""",

    "src/iot_metrics_module/utils/__init__.py": """\"\"\"Utility functions module\"\"\"

from .logger import get_logger
from .time_utils import (
    timestamp_to_bucket,
    bucket_to_timestamp,
    get_current_bucket,
)

__all__ = [
    "get_logger",
    "timestamp_to_bucket",
    "bucket_to_timestamp",
    "get_current_bucket",
]
""",

    "tests/__init__.py": "",
    "tests/unit/__init__.py": "",
    "tests/integration/__init__.py": "",
    "tests/fixtures/__init__.py": "",

    "pytest.ini": """[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    -v
    --strict-markers
    --cov=src/iot_metrics_module
    --cov-report=html
    --cov-report=term-missing
markers =
    unit: Unit tests
    integration: Integration tests
    slow: Slow tests
""",

    "setup.py": """from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="iot-metrics-module",
    version="1.0.0",
    author="BMAD Team",
    description="IoT Metrics Aggregation Module for Building Monitoring",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/bmad-project",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.11",
    install_requires=requirements,
    entry_points={
        "console_scripts": [
            "imae=iot_metrics_module.main:main",
        ],
    },
)
""",

    "Makefile": """# BMAD Project Makefile

.PHONY: help install test lint format clean docker-build docker-up docker-down

help:
\t@echo "BMAD Project - Available Commands"
\t@echo "=================================="
\t@echo "install       - Install dependencies"
\t@echo "test          - Run tests with coverage"
\t@echo "lint          - Run linters (flake8, mypy)"
\t@echo "format        - Format code (black, isort)"
\t@echo "clean         - Remove generated files"
\t@echo "docker-build  - Build Docker images"
\t@echo "docker-up     - Start Docker services"
\t@echo "docker-down   - Stop Docker services"
\t@echo "run           - Run the application"

install:
\tpip install -r requirements.txt
\tpip install -e .

test:
\tpytest tests/ -v --cov=src/iot_metrics_module --cov-report=html

lint:
\tflake8 src/ tests/
\tmypy src/

format:
\tblack src/ tests/
\tisort src/ tests/

clean:
\tfind . -type d -name "__pycache__" -exec rm -rf {} +
\tfind . -type f -name "*.pyc" -delete
\tfind . -type f -name "*.pyo" -delete
\tfind . -type d -name "*.egg-info" -exec rm -rf {} +
\trm -rf build/ dist/ htmlcov/ .coverage .pytest_cache/

docker-build:
\tdocker-compose build

docker-up:
\tdocker-compose up -d

docker-down:
\tdocker-compose down

run:
\tpython src/iot_metrics_module/main.py
""",

    "CONTRIBUTING.md": """# Contributing to BMAD

Thank you for your interest in contributing to the Building Monitoring Analytics & Diagnostics project!

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/bmad-project.git`
3. Create a virtual environment: `python3 -m venv venv`
4. Activate it: `source venv/bin/activate`
5. Install dependencies: `make install`
6. Create a branch: `git checkout -b feature/your-feature-name`

## Code Standards

- Follow PEP 8 style guide
- Write docstrings for all functions and classes
- Add type hints to function signatures
- Maintain test coverage above 85%
- Format code with `black` and `isort`
- Run linters before committing: `make lint`

## Testing

```bash
# Run all tests
make test

# Run specific test file
pytest tests/unit/test_metrics_compute.py -v

# Run with coverage
pytest --cov=src/iot_metrics_module --cov-report=html
```

## Commit Messages

Use conventional commit format:

- `feat: Add new KPI computation`
- `fix: Correct drift score calculation`
- `docs: Update API documentation`
- `test: Add integration tests for ML pipeline`
- `refactor: Simplify DataLoader class`

## Pull Request Process

1. Update documentation for any new features
2. Add tests for new functionality
3. Ensure all tests pass: `make test`
4. Run code formatters: `make format`
5. Submit PR with clear description of changes
6. Link related issues in PR description

## Questions?

Open an issue or contact the team at dev@example.com
""",

    "LICENSE": """MIT License

Copyright (c) 2025 BMAD Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
""",
}

def create_directory_structure(base_path: Path, structure: Dict, prefix: str = ""):
    """Recursively create directory structure"""
    for name, children in structure.items():
        dir_path = base_path / name
        try:
            dir_path.mkdir(parents=True, exist_ok=True)
            print_success(f"{prefix}Created: {dir_path}")
            
            # Create __init__.py for Python packages
            if name not in ["docs", "tests", "docker", "scripts", "monitoring"] and isinstance(children, dict):
                init_file = dir_path / "__init__.py"
                if not init_file.exists():
                    init_file.write_text("")
                    print_info(f"{prefix}  Added: __init__.py")
            
            if isinstance(children, dict) and children:
                create_directory_structure(dir_path, children, prefix + "  ")
        except Exception as e:
            print_error(f"{prefix}Failed to create {dir_path}: {e}")

def create_file(base_path: Path, filename: str, content: str):
    """Create a file with given content"""
    file_path = base_path / filename
    try:
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text(content)
        print_success(f"Created: {file_path}")
    except Exception as e:
        print_error(f"Failed to create {file_path}: {e}")

def generate_project_structure(project_name: str = "bmad-project"):
    """Main function to generate complete project structure"""
    
    print_header("BMAD Project Structure Generator")
    
    # Get current directory
    base_path = Path.cwd() / project_name
    
    # Check if directory exists
    if base_path.exists():
        print_warning(f"Directory '{project_name}' already exists!")
        response = input(f"Do you want to continue? (y/N): ").strip().lower()
        if response != 'y':
            print_info("Operation cancelled.")
            return
    
    print_info(f"Creating project structure in: {base_path}\n")
    
    # Create directory structure
    print_header("Creating Directory Structure")
    create_directory_structure(base_path, PROJECT_STRUCTURE)
    
    # Create files from templates
    print_header("Creating Project Files")
    for filename, content in TEMPLATES.items():
        create_file(base_path, filename, content)
    
    # Create empty placeholder files
    print_header("Creating Additional Files")
    additional_files = [
        "docs/architecture/README.md",
        "docs/api/README.md",
        "scripts/init_database.py",
        "scripts/generate_sample_data.py",
        "monitoring/prometheus/prometheus.yml",
    ]
    
    for filepath in additional_files:
        file_path = base_path / filepath
        if not file_path.exists():
            file_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.write_text(f"# {filepath}\n\nTODO: Add content\n")
            print_success(f"Created: {file_path}")
    
    # Create success message
    print_header("Project Setup Complete!")
    print_success(f"Project '{project_name}' has been created successfully!\n")
    
    print(f"{Colors.OKCYAN}Next Steps:{Colors.ENDC}")
    print(f"{Colors.OKBLUE}1. cd {project_name}{Colors.ENDC}")
    print(f"{Colors.OKBLUE}2. python3 -m venv venv{Colors.ENDC}")
    print(f"{Colors.OKBLUE}3. source venv/bin/activate  # On Windows: venv\\Scripts\\activate{Colors.ENDC}")
    print(f"{Colors.OKBLUE}4. pip install -r requirements.txt{Colors.ENDC}")
    print(f"{Colors.OKBLUE}5. cp .env.example .env  # Configure your environment{Colors.ENDC}")
    print(f"{Colors.OKBLUE}6. Edit .env with your database credentials{Colors.ENDC}")
    print(f"{Colors.OKBLUE}7. python src/iot_metrics_module/main.py{Colors.ENDC}\n")
    
    print(f"{Colors.OKGREEN}Or use Docker:{Colors.ENDC}")
    print(f"{Colors.OKBLUE}docker-compose up -d{Colors.ENDC}\n")
    
    print(f"{Colors.WARNING}Don't forget to:{Colors.ENDC}")
    print(f"{Colors.WARNING}- Initialize git: git init{Colors.ENDC}")
    print(f"{Colors.WARNING}- Add remote: git remote add origin <your-repo-url>{Colors.ENDC}")
    print(f"{Colors.WARNING}- Create initial commit: git add . && git commit -m 'Initial commit'{Colors.ENDC}")
    print(f"{Colors.WARNING}- Push to GitHub: git push -u origin main{Colors.ENDC}\n")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Generate BMAD project structure",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python setup_bmad_project.py
  python setup_bmad_project.py --name my-bmad-project
        """
    )
    parser.add_argument(
        "--name",
        "-n",
        default="bmad-project",
        help="Project directory name (default: bmad-project)"
    )
    
    args = parser.parse_args()
    
    try:
        generate_project_structure(args.name)
    except KeyboardInterrupt:
        print(f"\n\n{Colors.WARNING}Operation cancelled by user.{Colors.ENDC}")
        sys.exit(1)
    except Exception as e:
        print_error(f"An error occurred: {e}")
        sys.exit(1)