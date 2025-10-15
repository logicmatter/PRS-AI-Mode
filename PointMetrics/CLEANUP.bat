@echo off
REM ============================================================
REM PointMetrics Project Cleanup Script
REM This script removes unnecessary files and reorganizes the project
REM ============================================================

echo.
echo ============================================================
echo           PointMetrics Project Cleanup
echo ============================================================
echo.

REM Change to script directory
cd /d "%~dp0"

echo Starting cleanup...
echo.

REM 1. Remove bmad-project folder (template already applied)
if exist "bmad-project\" (
    echo [1/7] Removing bmad-project folder...
    rmdir /s /q "bmad-project"
    if not exist "bmad-project\" (
        echo       SUCCESS: Removed bmad-project folder
    ) else (
        echo       WARNING: Could not remove bmad-project
    )
) else (
    echo [1/7] SKIP: bmad-project folder not found
)

REM 2. Remove node_modules folder
if exist "node_modules\" (
    echo [2/7] Removing node_modules folder...
    rmdir /s /q "node_modules"
    if not exist "node_modules\" (
        echo       SUCCESS: Removed node_modules folder
    ) else (
        echo       WARNING: Could not remove node_modules
    )
) else (
    echo [2/7] SKIP: node_modules folder not found
)

REM 3. Remove package.json
if exist "package.json" (
    echo [3/7] Removing package.json...
    del /f /q "package.json"
    if not exist "package.json" (
        echo       SUCCESS: Removed package.json
    ) else (
        echo       WARNING: Could not remove package.json
    )
) else (
    echo [3/7] SKIP: package.json not found
)

REM 4. Remove package-lock.json
if exist "package-lock.json" (
    echo [4/7] Removing package-lock.json...
    del /f /q "package-lock.json"
    if not exist "package-lock.json" (
        echo       SUCCESS: Removed package-lock.json
    ) else (
        echo       WARNING: Could not remove package-lock.json
    )
) else (
    echo [4/7] SKIP: package-lock.json not found
)

REM 5. Move bmad-init.py to scripts folder
if exist "bmad-init.py" (
    echo [5/7] Moving bmad-init.py to scripts folder...
    if not exist "scripts\" mkdir "scripts"
    move /y "bmad-init.py" "scripts\bmad-init.py" >nul
    if exist "scripts\bmad-init.py" (
        echo       SUCCESS: Moved bmad-init.py to scripts\
    ) else (
        echo       WARNING: Could not move bmad-init.py
    )
) else (
    echo [5/7] SKIP: bmad-init.py not found
)

REM 6. Rename readme.md to SETUP-NOTES.md
if exist "readme.md" (
    echo [6/7] Renaming readme.md to SETUP-NOTES.md...
    move /y "readme.md" "SETUP-NOTES.md" >nul
    if exist "SETUP-NOTES.md" (
        echo       SUCCESS: Renamed readme.md to SETUP-NOTES.md
    ) else (
        echo       WARNING: Could not rename readme.md
    )
) else (
    echo [6/7] SKIP: readme.md not found
)

REM 7. Create proper README.md using Python
echo [7/7] Creating proper README.md...
python -c "readme = '''# PointMetrics - IoT Metrics Aggregation Module\n\nA production-grade batch processing engine for computing KPIs on time-series IoT sensor data.\n\n## Overview\n\n**PointMetrics** (IMAE - IoT Metrics Aggregation Engine) processes raw IoT sensor data into pre-computed KPIs at 15-minute intervals, supporting 100+ tenants and ~250K samples/day per system.\n\n### Key Features\n\n- ✅ 15-minute batch processing (scheduled and on-demand)\n- ✅ 25+ KPIs (Base, Behavior, Distribution, Trend metrics)\n- ✅ ML Integration (K-means clustering, anomaly detection)\n- ✅ Multi-tenant support (100+ concurrent tenants)\n- ✅ Parquet-first storage (fast columnar with partitioning)\n- ✅ Production-ready (monitoring, logging, alerting)\n\n## Quick Start\n\n### Installation\n\n```bash\n# Create virtual environment\npython -m venv venv\nvenv\\\\Scripts\\\\activate  # Windows\n\n# Install dependencies\npip install -r requirements.txt\npip install -e .\n```\n\n### Configuration\n\n```bash\n# Copy and edit environment file\ncopy .env.example .env\n# Edit .env with your settings\n```\n\n### Running\n\n```bash\n# Start the service\npython src/iot_metrics_module/main.py\n# or\nimae\n```\n\n## Project Structure\n\n```\nPointMetrics/\n├── src/iot_metrics_module/  # Source code\n│   ├── config/              # Configuration\n│   ├── data/                # Data models and loading\n│   ├── metrics/             # KPI computation\n│   ├── ml/                  # Machine learning\n│   ├── storage/             # Parquet storage\n│   ├── scheduler/           # Job scheduling\n│   ├── api/                 # REST API\n│   └── utils/               # Utilities\n├── tests/                   # Test suites\n├── scripts/                 # Utility scripts\n├── docs/                    # Documentation\n├── docker/                  # Containers\n└── monitoring/              # Monitoring setup\n```\n\n## Development\n\n### Running Tests\n```bash\npytest tests/ -v --cov=src/iot_metrics_module\n```\n\n### Code Quality\n```bash\nblack src/ tests/      # Format\nflake8 src/ tests/     # Lint\nmypy src/              # Type check\n```\n\n## Documentation\n\n- [Architecture Design](docs/architecture/iot_metrics_module_design.md)\n- [Parquet Storage](docs/parquet-refactoring.md)\n- [Development Roadmap](docs/next-steps.md)\n- [AI Assistant Guide](CLAUDE.md)\n\n## Performance Targets\n\n- **Throughput:** ~2.6K samples per 15-min bucket\n- **Processing Time:** <2s per bucket (100 sensors)\n- **Memory:** ~200KB per batch\n- **Scale:** 100+ tenants, ~250K samples/day\n\n## Current Status\n\n**Phase 1 - Core Implementation**\n\nCompleted:\n- ✅ Project structure\n- ✅ Parquet storage architecture\n- ✅ Data models (Pydantic)\n- ✅ Metrics computation framework\n- ✅ Storage adapter\n- ✅ Synthetic data generator\n\nIn Progress:\n- 🔄 ML pipeline\n- 🔄 API endpoints\n- 🔄 Test coverage\n\n## License\n\nMIT License - See [LICENSE](LICENSE)\n'''; f = open('README.md', 'w', encoding='utf-8'); f.write(readme); f.close(); print('Created README.md')"
if exist "README.md" (
    echo       SUCCESS: Created README.md
) else (
    echo       WARNING: Could not create README.md
)

echo.
echo ============================================================
echo Cleanup operations completed!
echo ============================================================
echo.

REM 8. Remove cleanup scripts
echo Removing cleanup scripts...
if exist "cleanup_project.py" del /f /q "cleanup_project.py"
if exist "cleanup_project.bat" del /f /q "cleanup_project.bat"
if exist "organize_project.py" del /f /q "organize_project.py"

echo.
echo ============================================================
echo           Cleanup Complete!
echo ============================================================
echo.
echo Project structure is now organized:
echo   ✓ Removed duplicate bmad-project folder
echo   ✓ Removed Node.js files (node_modules, package.json)
echo   ✓ Moved bmad-init.py to scripts/
echo   ✓ Created proper README.md
echo   ✓ Preserved setup notes as SETUP-NOTES.md
echo   ✓ Removed cleanup scripts
echo.
echo The PointMetrics project is ready for development!
echo.
pause
