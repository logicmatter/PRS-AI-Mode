# Flattened Codebase Analysis - Quick Reference

## Run Analysis

```bash
# Easy way (recommended)
./run_analysis.sh

# Direct way
python3 analyze_flattened_codebase.py
```

## View Results

```bash
# Full text report
cat CODEBASE_ANALYSIS_REPORT.txt

# Executive summary
cat ANALYSIS_SUMMARY.md

# Quick stats
head -n 20 CODEBASE_ANALYSIS_REPORT.txt
```

## Key Metrics

| Metric | Value |
|--------|-------|
| Files | 1,027 |
| Lines | 107,018 |
| Size | 3.97 MB |
| Projects | 24 |
| Components | 137 |
| Services | 24 |
| Modules | 56 |

## Angular Projects (12 Applications)

### Monitoring
- AppTrend, AppAlarm, AppEnergy
- AppCrEnv, AppCrEqp, AppIndoorAirQuality

### Business Operations  
- AppInventory, AppSales, AppOrderProcessing
- AppReturns, AppBilling, AppGRN

### Reports & Config
- AppAdhoc, AppEvaluationDataReport
- AppFieldTrailReport, AppDevConf, AppBase

## Technology Stack

- Angular 14.3.0
- TypeScript
- Angular Material 14.0.5
- RxJS 7.5.0

## File Locations

```
analyze_flattened_codebase.py  # Analysis script (382 lines)
run_analysis.sh                # Convenience runner

CODEBASE_ANALYSIS_REPORT.txt   # Detailed report (4 KB)
CODEBASE_ANALYSIS_REPORT.json  # JSON data (6 KB)
ANALYSIS_SUMMARY.md            # Executive summary (5 KB)
CODEBASE_ANALYSIS_README.md    # Full documentation (5 KB)
```

## Programmatic Access

```python
# Load JSON report
import json
with open('CODEBASE_ANALYSIS_REPORT.json') as f:
    data = json.load(f)
    
# Access metrics
print(f"Total files: {data['overview']['total_files']}")
print(f"Projects: {len(data['projects'])}")
print(f"Components: {data['angular_structure']['components']}")
```

```bash
# Using jq
jq '.overview' CODEBASE_ANALYSIS_REPORT.json
jq '.projects[]' CODEBASE_ANALYSIS_REPORT.json
jq '.angular_structure' CODEBASE_ANALYSIS_REPORT.json
```

## Common Tasks

### Check for large files
```bash
jq '.top_files_by_size[0:5]' CODEBASE_ANALYSIS_REPORT.json
```

### Count components by project
```bash
grep -c "projects.*component.ts" CODEBASE_ANALYSIS_REPORT.json
```

### List all dependencies
```bash
jq '.dependencies' CODEBASE_ANALYSIS_REPORT.json
```

## Documentation Hierarchy

1. **QUICK_REFERENCE.md** ← You are here (this file)
2. **ANALYSIS_SUMMARY.md** - Executive summary with insights
3. **CODEBASE_ANALYSIS_REPORT.txt** - Detailed analysis
4. **CODEBASE_ANALYSIS_README.md** - Complete documentation

## Need Help?

- See **ANALYSIS_SUMMARY.md** for insights and recommendations
- See **CODEBASE_ANALYSIS_README.md** for detailed documentation
- Run `./run_analysis.sh` to regenerate reports
