# Private home-network HTTPS

Target: `https://reelcase.home.arpa:8443`. This is a **prepared gateway**, not
proof that a phone can resolve or trust it. No public tunnel, account, router
port forwarding, wildcard Vite host allowance, or HTTP redirect is created.
The existing HTTP origin is deliberately retained for recovery.

## Host setup

Use PowerShell on Windows with the existing app running through `npm run dev`:

```powershell
./scripts/lan-https.ps1 install
./scripts/lan-https.ps1 start -LanAddress <this-PC-private-LAN-IP>
./scripts/lan-https.ps1 status
```

Installation downloads Caddy 2.11.4 from its official GitHub release and verifies
the ZIP against the release SHA-512 checksum before extracting its executable.
The gateway binds only the specified interface on TCP 8443. Caddy's admin API,
HTTP redirects and automatic root installation are disabled. WebSocket proxying
is supported. The app's existing HTTP server remains unchanged.

Certificates and CA private keys live under `%LOCALAPPDATA%/Reelcase/https`,
**outside the repository and the web root**. Runtime logs/binary/PID live in
the ignored `.local-https` directory. Never publish the CA private keys.

## One-time network/device setup — explicit owner approval required

1. Reserve this PC's LAN IP in the router's DHCP settings. Add a local DNS A
   record mapping `reelcase.home.arpa` to that IP. Devices must use that local
   DNS resolver. A Windows hosts entry affects only that PC, not phones.
2. If Windows Firewall blocks the gateway, authorize an inbound rule scoped to
   this Caddy executable, TCP 8443, **Private profile and LocalSubnet only**.
   Do not enable router port forwarding or expose the Vite server publicly.
3. Copy only `pki/authorities/local/root.crt` from the TLS storage directory to
   trusted devices. Confirm its SHA-256 fingerprint through a trusted channel.
   Install it as a trusted root on each device. On iOS/iPadOS, profile install
   and enabling full trust under Certificate Trust Settings are separate steps.
   On Android, use the device's CA certificate installation setting. Managed
   devices and some browsers may require separate trust configuration.
4. A trusted local CA can issue certificates your device accepts. Treat its
   private key like a password; only trust the certificate on devices you own.
   Never proceed past certificate warnings as a substitute for trust setup.

These scripts do **not** change router DNS, certificate trust, firewall rules,
or Windows startup settings silently. The app and gateway must both be running;
automatic startup remains a separate installation decision.

## Preserve the existing library before switching

HTTP and HTTPS are different browser storage origins. HTTPS does not erase the
old library, but it initially opens a separate one. Do not clear the old site's
storage, uninstall it, or automatically redirect it.

1. At the **old address in the existing browser profile**, use Settings →
   **Export library pack**. Keep that private ZIP as an offline backup.
2. At the new HTTPS address, use **Import library pack** with merge mode.
3. Compare follows, History, Continue, favorites, ratings, and Adult marks
   before moving daily use to HTTPS. Repeat for each browser/device whose
   existing data you want to preserve. Imports are not automatic cross-device
   syncing.

The current pack preserves supported activity and metadata, not a byte-for-byte
browser clone. Local video files, folder permissions, full provider caches,
and every app setting are not transferred by the pack. Reconnect local folders
on the new origin and refresh provider catalogs as needed. Phones cannot access
the PC's local files merely by visiting this URL. Keep the original origin and
backup until those differences have been reviewed.

## Acceptance checks / rollback

- Resolve the hostname to the intended LAN IP on the PC **and** phone.
- Confirm HTTPS without certificate warnings, desktop/mobile rendering, and
  the actual Twitch VOD/live/clip players (not just the Home screen).
- Confirm supported recovery-pack counts after import; leave the old library.
- Test Watch Room connectivity and Companion separately. Secure-context access
  does not automatically grant local-network/Companion permissions.
- `./scripts/lan-https.ps1 stop` stops only the recorded gateway executable.
  It does not delete certificates, exports, or browser data. Return to the old
  address to continue using the untouched original library.

References: [Caddy local HTTPS](https://caddyserver.com/docs/automatic-https),
[Caddy reverse proxy](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy).
