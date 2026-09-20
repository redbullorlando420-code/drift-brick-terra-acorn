[CmdletBinding()]
param(
    [ValidateSet('install', 'start', 'stop', 'status')][string]$Action = 'status',
    [string]$LanAddress
)
$ErrorActionPreference = 'Stop'
$projectDir = Split-Path $PSScriptRoot -Parent
$runtimeDir = Join-Path $projectDir '.local-https'
$binary = Join-Path $runtimeDir 'caddy.exe'
$pidFile = Join-Path $runtimeDir 'gateway.pid'
$configFile = Join-Path $projectDir 'ops/lan-https/Caddyfile'
# Never store CA private keys in Vite's served workspace or an export pack.
$tlsDir = Join-Path $env:LOCALAPPDATA 'Reelcase/https'
$version = '2.11.4'

function Get-Gateway {
    if (!(Test-Path -LiteralPath $pidFile)) { return $null }
    $gatewayId = 0
    if (![int]::TryParse((Get-Content -LiteralPath $pidFile -Raw).Trim(), [ref]$gatewayId)) { throw 'Invalid gateway PID file.' }
    $gateway = Get-Process -Id $gatewayId -ErrorAction SilentlyContinue
    if ($gateway -and $gateway.Path -ne $binary) { throw 'PID belongs to another program; refusing to manage it.' }
    return $gateway
}

if ($Action -eq 'install') {
    New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
    if (Test-Path -LiteralPath $binary) { throw 'Caddy already exists. Inspect its version before replacing it.' }
    $archiveName = "caddy_${version}_windows_amd64.zip"
    $releaseUrl = "https://github.com/caddyserver/caddy/releases/download/v$version"
    $archive = Join-Path $runtimeDir $archiveName
    $checksumContent = (Invoke-WebRequest "$releaseUrl/caddy_${version}_checksums.txt").Content
    $checksums = if ($checksumContent -is [byte[]]) { [Text.Encoding]::UTF8.GetString($checksumContent) } else { [string]$checksumContent }
    $matching = @($checksums -split "`n" | Where-Object { $_.Trim() -match ('^[a-fA-F0-9]{128}\s+\*?' + [regex]::Escape($archiveName) + '$') })
    if ($matching.Count -ne 1) { throw 'Official checksum entry missing or ambiguous.' }
    Invoke-WebRequest "$releaseUrl/$archiveName" -OutFile $archive
    $expected = ($matching[0].Trim() -split '\s+')[0]
    if ((Get-FileHash -LiteralPath $archive -Algorithm SHA512).Hash -ne $expected) { throw 'Caddy checksum mismatch; archive will not be executed.' }
    # Extract only the executable; never expand arbitrary archive paths.
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [IO.Compression.ZipFile]::OpenRead($archive)
    try {
        $entry = $zip.GetEntry('caddy.exe')
        if (!$entry) { throw 'Caddy executable missing from verified archive.' }
        [IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $binary, $false)
    } finally { $zip.Dispose() }
    Write-Output "Installed checksum-verified Caddy $version. No trust, DNS, firewall, or startup settings changed."
    exit
}

if ($Action -eq 'stop') {
    $gateway = Get-Gateway
    if ($gateway) { Stop-Process -Id $gateway.Id; Write-Output 'HTTPS gateway stopped; original HTTP app and library unchanged.' }
    else { Write-Output 'HTTPS gateway is not running.' }
    exit
}

if ($Action -eq 'start') {
    if (Get-Gateway) { Write-Output 'HTTPS gateway is already running.'; exit }
    if (!(Test-Path -LiteralPath $binary)) { throw 'Install the gateway first.' }
    $parsed = $null
    if (![Net.IPAddress]::TryParse($LanAddress, [ref]$parsed) -or $parsed.AddressFamily -ne [Net.Sockets.AddressFamily]::InterNetwork) { throw 'Specify this PC''s private IPv4 LAN address.' }
    $bytes = $parsed.GetAddressBytes()
    if (!(($bytes[0] -eq 10) -or ($bytes[0] -eq 172 -and $bytes[1] -ge 16 -and $bytes[1] -le 31) -or ($bytes[0] -eq 192 -and $bytes[1] -eq 168))) { throw 'Only private LAN addresses are supported.' }
    if (!(Get-NetIPAddress -AddressFamily IPv4 | Where-Object IPAddress -eq $LanAddress)) { throw 'The LAN address is not assigned to this PC.' }
    $null = Invoke-WebRequest 'http://127.0.0.1:8080/' -TimeoutSec 15
    New-Item -ItemType Directory -Path $tlsDir -Force | Out-Null
    $env:REELCASE_TLS_STORAGE = $tlsDir.Replace('\', '/')
    $env:REELCASE_LAN_IP = $LanAddress
    & $binary validate --config $configFile --adapter caddyfile
    if ($LASTEXITCODE -ne 0) { throw 'Gateway configuration did not validate.' }
    $gateway = Start-Process -FilePath $binary -ArgumentList @('run', '--config', ('"' + $configFile + '"'), '--adapter', 'caddyfile') -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $runtimeDir 'stdout.log') -RedirectStandardError (Join-Path $runtimeDir 'stderr.log')
    $gateway.Id | Set-Content -LiteralPath $pidFile
    Write-Output "Started gateway process $($gateway.Id). DNS, certificate trust, and firewall readiness must still be verified."
}

$gateway = Get-Gateway
Write-Output "Gateway running: $([bool]$gateway)"
Write-Output 'Target URL: https://reelcase.home.arpa:8443'
Write-Output "Public root certificate: $(Join-Path $tlsDir 'pki/authorities/local/root.crt')"
Write-Output 'Do not share root.key or intermediate.key. See ops/lan-https/README.md for device trust and migration.'
