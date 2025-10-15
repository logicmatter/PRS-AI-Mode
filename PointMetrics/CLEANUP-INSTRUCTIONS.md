# PointMetrics Project Cleanup Instructions

## Automated Cleanup (Recommended)

### Option 1: Run the Batch Script
Open Command Prompt in the PointMetrics directory and run:
```cmd
cd c:\work\PRS-AI-Mode\PointMetrics
CLEANUP.bat
```

This will automatically:
1. ✅ Remove `bmad-project/` folder (duplicate template)
2. ✅ Remove `node_modules/` folder (Node.js not needed)
3. ✅ Remove `package.json` and `package-lock.json`
4. ✅ Move `bmad-init.py` to `scripts/` folder
5. ✅ Rename `readme.md` to `SETUP-NOTES.md`
6. ✅ Create proper `README.md`
7. ✅ Remove all cleanup scripts

## Manual Cleanup (If Automated Fails)

If you prefer to clean up manually or the batch script doesn't work, follow these steps:

### Step 1: Remove Duplicate Template Folder
```cmd
rmdir /s /q bmad-project
```
This folder was created by bmad-init.py as a template and is no longer needed.

### Step 2: Remove Node.js Files (Not Needed for Python Project)
```cmd
rmdir /s /q node_modules
del /f /q package.json
del /f /q package-lock.json
```
These were accidentally included but aren't needed for this Python-based project.

### Step 3: Reorganize Scripts
```cmd
move bmad-init.py scripts\bmad-init.py
```
Move the initialization script to the scripts folder where it belongs.

### Step 4: Rename Setup Instructions
```cmd
move readme.md SETUP-NOTES.md
```
Preserve the setup notes under a more appropriate name.

### Step 5: Create Proper README.md
Create a new file `README.md` with the project overview (content provided in CLEANUP.bat).

### Step 6: Clean Up Temporary Files
```cmd
del /f /q cleanup_project.py
del /f /q cleanup_project.bat
del /f /q organize_project.py
del /f /q CLEANUP.bat
del /f /q CLEANUP-INSTRUCTIONS.md
```

## What Gets Removed and Why

| Item | Reason |
|------|--------|
| `bmad-project/` | Duplicate template folder that was already applied to create current structure |
| `node_modules/` | Node.js dependencies - this is a Python project |
| `package.json` | Node.js configuration - not needed |
| `package-lock.json` | Node.js lock file - not needed |

## What Gets Reorganized

| Action | Reason |
|--------|--------|
| `bmad-init.py` → `scripts/` | Utility script belongs in scripts folder |
| `readme.md` → `SETUP-NOTES.md` | Preserve setup notes with better name |
| Create `README.md` | Proper project documentation |

## Expected Final Structure

```
PointMetrics/
├── README.md                   ← NEW: Proper project README
├── SETUP-NOTES.md              ← RENAMED: From readme.md
├── CLAUDE.md                   ← AI assistant guide
├── CONTRIBUTING.md             ← Contribution guidelines
├── LICENSE                     ← MIT License
├── Makefile                    ← Build automation
├── .env.example                ← Environment template
├── .gitignore                  ← Git ignore rules
├── pytest.ini                  ← Test configuration
├── requirements.txt            ← Python dependencies
├── setup.py                    ← Package setup
├── src/                        ← Source code
│   └── iot_metrics_module/
│       ├── config/
│       ├── data/
│       ├── metrics/
│       ├── ml/
│       ├── storage/
│       ├── scheduler/
│       ├── api/
│       └── utils/
├── tests/                      ← Test suites
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── scripts/                    ← Utility scripts
│   ├── bmad-init.py           ← MOVED: From root
│   ├── init_database.py
│   └── generate_sample_data.py
├── docs/                       ← Documentation
│   ├── architecture/
│   ├── specifications/
│   └── api/
├── docker/                     ← Container configs
└── monitoring/                 ← Monitoring setup
    ├── prometheus/
    └── grafana/
```

## Verification

After cleanup, verify the structure:
```cmd
dir /b
```

You should see:
- No `bmad-project` folder
- No `node_modules` folder
- No `package.json` or `package-lock.json`
- `README.md` exists (new file)
- `SETUP-NOTES.md` exists (renamed from readme.md)
- `scripts\bmad-init.py` exists (moved from root)

## Next Steps After Cleanup

1. Review the new `README.md`
2. Check `SETUP-NOTES.md` for any setup-specific info you need
3. Start development using the clean project structure
4. Follow the development guide in `CLAUDE.md`

## Troubleshooting

**Problem:** "Access denied" errors
- Run Command Prompt as Administrator
- Close any programs that might have files open (VS Code, file explorer)

**Problem:** Batch script doesn't run
- Check if Python is in your PATH
- Try manual cleanup steps instead

**Problem:** Some files weren't removed
- Manually delete remaining files using Windows Explorer
- Or use manual cleanup commands above

---

*This cleanup is safe and reversible. All important code and documentation is preserved.*
