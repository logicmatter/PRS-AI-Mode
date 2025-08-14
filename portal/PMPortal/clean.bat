@echo OFF
echo Cleaning PmPortal...

REM Check if PmApps\node_modules exists, and if it does, delete it
IF exist .\PmApps\node_modules (
    echo Deleting node_modules in PmApps...
    rmdir /s /q .\PmApps\node_modules
) ELSE (
    echo node_modules does not exist in PmApps
)

REM Check if PmApps\dist exists, and if it does, delete it
IF exist .\PmApps\dist (
    echo Deleting dist folder in PmApps...
    rmdir /s /q .\PmApps\dist
) ELSE (
    echo dist folder does not exist in PmApps
)

REM Check if PmApps\.angular\cache exists, and if it does, delete it
IF exist .\PmApps\.angular\cache (
    echo Deleting Angular cache in PmApps...
    rmdir /s /q .\PmApps\.angular\cache
) ELSE (
    echo Angular cache does not exist in PmApps
)

echo Clean completed.
