@echo off
setlocal
cd /d "%~dp0.."
node "%~dp0setup-yt-dlp.mjs"
if errorlevel 1 (
  echo Setup failed. No system PATH changes were made.
  pause
  exit /b 1
)
echo yt-dlp is ready. Start or restart Realhub Companion to enable downloads and optional browser sign-in.
pause
