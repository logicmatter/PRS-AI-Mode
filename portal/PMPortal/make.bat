@echo OFF
echo Building PMPortal

REM Check if node_modules directory exists in pmApps
IF exist .\pmApps\node_modules (
    echo Node modules already exist
) ELSE (
    echo Installing node modules with force...
    cd pmApps
    call npm install --force
    echo NPM modules installed with force
)

REM Optional: return to the original directory
cd ..
