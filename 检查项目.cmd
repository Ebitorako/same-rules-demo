@echo off
setlocal
cd /d "%~dp0"
if not exist "node_modules\typescript\bin\tsc" (
  echo Please run the game launcher first to install project tools.
  pause
  exit /b 1
)
call npm.cmd run validate-data
if errorlevel 1 goto failed
call npm.cmd test
if errorlevel 1 goto failed
call npm.cmd run build
if errorlevel 1 goto failed
echo All checks passed. Release files are in dist.
pause
exit /b 0
:failed
echo A check failed. Read the message above and correct the source file.
pause
exit /b 1
