@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Please install Node.js LTS, then try again.
  pause
  exit /b 1
)
if not exist "node_modules\vite\bin\vite.js" (
  echo Installing project tools for the first run...
  call npm.cmd install --no-audit --no-fund
  if errorlevel 1 (
    echo Installation failed. Please check your internet connection.
    pause
    exit /b 1
  )
)
echo Same Rules? - local preview
echo Keep this window open while playing. Press Ctrl+C to stop.
echo Open http://127.0.0.1:5173/ in your browser.
call npm.cmd run dev -- --open
pause
