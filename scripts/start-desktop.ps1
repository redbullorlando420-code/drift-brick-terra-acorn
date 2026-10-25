# Compatibility entry point. Prefer Start-Realhub.cmd or Node desktop shortcut.
& node (Join-Path $PSScriptRoot "start-desktop.mjs") @args
