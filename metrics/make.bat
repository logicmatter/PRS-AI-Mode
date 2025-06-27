@echo off
setlocal

:: Base directory
set BASEDIR=.

:: Create folders if they do not exist
for %%F in (
    "%BASEDIR%\metrics"
    "%BASEDIR%\metrics\app"
    "%BASEDIR%\metrics\manager"
    "%BASEDIR%\metrics\service"
    "%BASEDIR%\metrics\storage"
) do (
    if not exist "%%F" (
        echo Creating folder %%F
        mkdir "%%F"
    )
)

:: Create empty files if they do not exist
for %%F in (
    "%BASEDIR%\.gitkeep"
    "%BASEDIR%\config.py"
    "%BASEDIR%\env.py"
    "%BASEDIR%\make.bat"
    "%BASEDIR%\app\dashboard.py"
    "%BASEDIR%\app\__init__.py"
    "%BASEDIR%\manager\compute.py"
    "%BASEDIR%\manager\generator.py"
    "%BASEDIR%\manager\kpis.py"
    "%BASEDIR%\manager\manager.py"
    "%BASEDIR%\manager\__init__.py"
    "%BASEDIR%\service\main.py"
    "%BASEDIR%\service\__init__.py"
    "%BASEDIR%\storage\publisher.py"
    "%BASEDIR%\storage\retriever.py"
    "%BASEDIR%\storage\storage.py"
    "%BASEDIR%\storage\subscriber.py"
    "%BASEDIR%\storage\__init__.py"
) do (
    if not exist "%%F" (
        echo Creating file %%F
        type nul > "%%F"
    )
)

echo All folders and files are checked/created.
endlocal
