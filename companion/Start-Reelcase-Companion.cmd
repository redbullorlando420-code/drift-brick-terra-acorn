@echo off
setlocal
cd /d "%~dp0.."
echo Starting Reelcase Companion. Keep this window open while using desktop shortcuts, source checks, or TV discovery.
npm run companion
echo.
echo Reelcase Companion stopped. Press any key to close this window.
pause >nul
