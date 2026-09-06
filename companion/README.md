# Reelcase Companion (early foundation)

This optional loopback service is the native boundary for desktop launching and local source verification. It binds only to `127.0.0.1`, checks the browser origin, and permits launches only from explicitly configured game roots. It does not scan disks, accept LAN requests, or transmit media.

The Windows Desktop is included as a guarded default launch location. Add other game roots with `REELCASE_ALLOWED_ROOTS`, separated by semicolons. Current endpoints include health, guarded desktop launch, source health/watch events, and Roku SSDP discovery.
