@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo [EventLens] Node.js 18+ was not found.
  echo Easiest option: double-click Open_Demo.html to run the offline Demo.
  pause
  exit /b 1
)
for /f %%V in ('node -p "process.versions.node.split('.')[0]"') do set "NODE_MAJOR=%%V"
if !NODE_MAJOR! LSS 18 (
  echo [EventLens] Your Node.js version is too old. Version 18+ is required.
  node -v
  pause
  exit /b 1
)
set "APP_PORT=8787"
set "MOCK_SETTING="
if exist .env (
  for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
    if /I "%%A"=="PORT" set "APP_PORT=%%B"
    if /I "%%A"=="MOCK_MODE" set "MOCK_SETTING=%%B"
  )
  set "APP_PORT=!APP_PORT:"=!"
  set "MOCK_SETTING=!MOCK_SETTING:"=!"
  echo !APP_PORT!| findstr /R "^[0-9][0-9]*$" >nul || (
    echo [EventLens] Invalid PORT in .env: !APP_PORT!
    pause
    exit /b 1
  )
  if /I not "!MOCK_SETTING!"=="true" if /I not "!MOCK_SETTING!"=="1" if /I not "!MOCK_SETTING!"=="yes" (
    echo [EventLens] Real LLM mode detected. Running API preflight first; this may incur a small amount of API/Web Search usage...
    node scripts\check_live.js
    if errorlevel 1 (
      echo [EventLens] Preflight failed. Demo was not started. Fix the .env or permission error shown above.
      pause
      exit /b 1
    )
  ) else (
    echo [EventLens] Mock mode is enabled in .env. No external API cost will be incurred.
  )
  start "" http://localhost:!APP_PORT!
  node server.js
) else (
  echo [EventLens] No .env found. Starting the Mock backend automatically with no API cost.
  start "" http://localhost:!APP_PORT!
  set "MOCK_MODE=true"
  set "PORT=!APP_PORT!"
  node server.js
)
pause
