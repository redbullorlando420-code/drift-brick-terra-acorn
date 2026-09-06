$ErrorActionPreference = 'Stop'
try {
  $response = Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8080/ -TimeoutSec 2
  if ($response.StatusCode -eq 200) { exit 0 }
} catch { }
Start-Process -FilePath npm.cmd -ArgumentList 'run dev' -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput "$PSScriptRoot/.grok/dev.log" -RedirectStandardError "$PSScriptRoot/.grok/dev-error.log"
