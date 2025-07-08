@echo off
REM Create folders
mkdir portal
mkdir portal\components
mkdir portal\reports
mkdir portal\assets
mkdir portal\data

REM Create .gitkeep files in folders to track empty folders in Git
type nul > portal\.gitkeep
type nul > portal\components\.gitkeep
type nul > portal\reports\.gitkeep
type nul > portal\assets\.gitkeep
type nul > portal\data\.gitkeep

REM Create placeholder python and css files (empty)
type nul > portal\app.py
type nul > portal\components\__init__.py
type nul > portal\components\navbar.py
type nul > portal\components\sidebar.py
type nul > portal\components\parameterbar.py
type nul > portal\components\canvasbar.py
type nul > portal\reports\__init__.py
type nul > portal\reports\trend_report.py
type nul > portal\assets\style.css
type nul > portal\data\sample_data.py

echo Folder structure and files created.
