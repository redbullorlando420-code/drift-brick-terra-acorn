# Pending local-origin transfer

The requested copy has **not** been performed. Do not describe the library as transferred.

The user first named 10.1.11.1, then supplied http://127.0.0.1:8080/ as the working address. The latter serves the existing app on this computer. It is a separate browser storage origin from http://localhost:8080/, even when both serve the same source/build.

Read-only checks of http://10.1.11.1/, http://10.1.11.1:8080/ and https://10.1.11.1/ timed out, including after the user said the destination was on. No saved data was sent to that address.

An existing Chrome tab at http://localhost:8080/ was identified, but supported browser attachment repeatedly timed out before its controls could be read. Its private browser library was not exported, read from profile files, cleared or replaced. Disposable QA profiles are not the user's real library.

To finish, identify the intended reachable destination and obtain working access to the source browser UI. Export/inspect the actual library before any destination mutation. Existing library packs cover personal metadata; they do not include native source files, all tool state or transferable browser directory permissions. Do not claim an “everything” transfer from a metadata-only backup.
