# PROJECT CLEANUP - QUICK START

## ⚡ Quick Action (30 seconds)

Open Command Prompt and run:

```cmd
cd c:\work\PRS-AI-Mode\PointMetrics
CLEANUP.bat
```

Press Enter and wait. Done! ✅

---

## 📋 What Will Happen

The script will:
1. Remove `bmad-project` folder (duplicate template)
2. Remove `node_modules` folder (Node.js not needed)
3. Remove `package.json` and `package-lock.json` (Node.js files)
4. Move `bmad-init.py` to `scripts/` folder
5. Rename `readme.md` to `SETUP-NOTES.md`
6. Create proper `README.md`
7. Clean up all cleanup scripts

## ✅ Result

Your project will be clean and organized:

```
PointMetrics/
├── README.md              ← NEW proper README
├── SETUP-NOTES.md         ← Preserved notes
├── CLAUDE.md
├── CONTRIBUTING.md
├── LICENSE
├── src/                   ← Your source code
├── tests/                 ← Your tests
├── scripts/               ← Utility scripts (including bmad-init.py)
├── docs/                  ← Documentation
├── docker/
└── monitoring/
```

## 🔧 If Automated Cleanup Doesn't Work

Run these commands one by one:

```cmd
cd c:\work\PRS-AI-Mode\PointMetrics
rmdir /s /q bmad-project
rmdir /s /q node_modules
del /f /q package.json
del /f /q package-lock.json
move bmad-init.py scripts\bmad-init.py
move readme.md SETUP-NOTES.md
```

Then create `README.md` manually using the content from CLEANUP.bat.

## 📞 Need Help?

Read `CLEANUP-INSTRUCTIONS.md` for detailed step-by-step manual cleanup.

---

**Ready? Run `CLEANUP.bat` now!**
