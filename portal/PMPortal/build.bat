@echo off
echo building PMPortal

IF exist ..\pmbin\portal ( echo ..\pmnin\portal target exists.) ELSE ( mkdir ..\pmbin\portal && echo pmbin\portal is created )

IF exist .\PmApps\node_modules  ( echo node modules exists ) ELSE (call make.bat)

IF exist ..\pmbin\platform\PmPlatform.exe (echo yes starting pmplatform && start /D "..\pmbin\platform" ..\pmbin\platform\PMPlatform.exe ) else (echo no pmplatform.exe started)

IF exist ..\pmbin\portal ( cd .\PmApps && call ng build --prod)


