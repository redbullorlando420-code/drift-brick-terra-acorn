@echo off
setlocal
cd /d "%~dp0.."
title Reelcase Companion
echo Starting Reelcase Companion on 127.0.0.1 (loopback only)...
echo Leave this window open. Use Reelcase Settings to enable Windows auto-start.
echo Approved roots: Desktop + REELCASE_ALLOWED_ROOTS
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required on PATH.
  pause
  exit /b 1
)
node "%~dp0reelcase-companion.mjs"
pause
