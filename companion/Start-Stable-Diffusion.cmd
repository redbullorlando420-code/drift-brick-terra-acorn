@echo off
setlocal
cd /d "%~dp0tools\stable-diffusion-webui"
set PYTHON=%~dp0tools\stable-diffusion-webui\venv\Scripts\python.exe
set VENV_DIR=%~dp0tools\stable-diffusion-webui\venv
set TORCH_COMMAND=pip install torch==2.7.1 torchvision==0.22.1 --index-url https://download.pytorch.org/whl/cu128
set HF_HOME=%~dp0tools\hf-cache
set TORCH_HOME=%~dp0tools\torch-cache
set PIP_CACHE_DIR=%~dp0tools\pip-cache
set GRADIO_ANALYTICS_ENABLED=False
set HF_HUB_DISABLE_TELEMETRY=1
set GIT_TERMINAL_PROMPT=0
set COMMANDLINE_ARGS=--api --server-name 127.0.0.1 --port 7860
call webui.bat
pause
