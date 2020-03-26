@echo off
cd %current_dir%

if "%1"=="--install" (
echo [94mInstalling Dependencies[0m
call npm install
if %ERRORLEVEL% == 0 goto :startBuild
echo [91mERROR: Error installing dependencies for Component Portal[0m
goto :done
)


:startBuild
echo [94mBuilding Component Portal[0m
call npm run build

if %ERRORLEVEL% == 0 goto :startCopy
echo [91mERROR: Error building Component Portal[0m
goto :done

:startCopy
echo [92mDone Building[0m
echo [94mCopying Component Portal files to EndPoint[0m
call xcopy /e /y /i /q "dist\ComponentPortal" "..\EndPointService\public\Apps\ComponentPortal"

if %ERRORLEVEL% == 0 goto :finish
echo [91mERROR: Error copying Component Portal files to EndPoint[0m
goto :done

:finish
echo [92mDone Copying[0m
goto :done

:done
echo Done