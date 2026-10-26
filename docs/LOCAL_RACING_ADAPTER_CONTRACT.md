# Stream Signal local racing adapter contract v1

This is an offline boundary and validator, not an installed-game integration. The battle lab demonstrates batching. Neither that lab nor this contract implements driving, reads iRacing Arcade telemetry, connects real chat or authenticates a real service. A separate permitted local adapter, supported game integration and supervised native tests remain required.

## Transport and pairing responsibilities

The future local service must verify transport authentication, explicit supervised pairing, the exact approved app origin and a bounded session expiry. It supplies `RacingTrust` to the validator **after** these checks. The `authenticated` and `paired` booleans in the downloadable example are synthetic test context; JSON messages cannot grant trust. They must never be accepted as a client assertion in a real service. Keep credentials at the local service, outside URLs, logs, exports and this UI. Use a cryptographically random session identity and an authenticated local transport; a session name alone is not a credential.

Origin comparison is exact, with no wildcard and no credential-bearing URL. Pairing loss, mismatched session, expiry, invalid/backwards controller clock or local emergency stop clear all pending/active strategies and latch stop. A new supervised session is needed to resume. The future service must own this state; it cannot trust browser-supplied queue state. It should bind loopback by default and expose only supported game-specific operations. No transport is implemented here, so this document does not claim those deployment checks have passed.

## Messages

Every message has `version: 1`, a matching `session` and a known `type`. Unknown versions, fields and commands are rejected. JSON input is bounded to 8,192 code units; accepted messages contain only the small, known fields below. Source: `src/lib/racing-adapter-contract.ts`. The AI Blueprint can export a complete synthetic observation/intent example without executing a command.

- **observation**: increasing positive `seq`, integer controller-clock `at`, booleans `ready`, `clear`, `danger`, and `grip: good|low`. Future, backwards or older-than-1000ms observations are rejected. Unsafe readiness/danger latches stop. The separate local adapter must derive telemetry from supported game observations, not untrusted chat.
- **intent**: unique `id`, increasing positive intent `seq`, `sentAt`, `expiresAt`, exact current `observationSeq` and one to four whole `steps`. Admission requires a valid paired session, a message no older than 1000ms and a lifetime no longer than 5000ms. Each step contains a strategic `strategy`, a 100–5000ms `timeoutMs`, and unique `requires` entries from `ready`, `clear`, `grip`. Allowed strategies are `push`, `conserve`, `hold-line`, `overtake-clear`. No raw keys, steering values, paths or shell commands are accepted. Four active/queued sequences are allowed in total; overflow rejects the entire incoming sequence.
- **ack**: matching active `intentId`, zero-based `step`, current `observationSeq` and `outcome: completed|interrupted`. It cannot acknowledge a different/stale stage. The controller must report a real observed outcome; accepting an intent is not completion. An interrupted or unsafe stage clears work and latches stop.
- **stop**: clears the queue and active stage and latches stop. Authenticated transport is required for remote messages. A local physical/supervised emergency stop must work unconditionally through `emergencyStopRacing` even if transport authentication has failed.

## Dispatch, conditions and timeouts

Admission only queues strategic intent. `dispatchRacingStep` is a separate local-controller check, and the offline UI only returns a simulated dispatch descriptor. Every dispatch rechecks current readiness, danger, freshness, required conditions and remaining lifetime. Push and overtake require good grip; overtaking always requires verified clearance, even if a message omits those conditions. After a stage, the next step requires an observation newer than the previous dispatch. A fresh acknowledgement may carry that newer observation; otherwise send fresh telemetry before the next dispatch.

One active stage is allowed. Its acknowledgement deadline is the earliest of step timeout, overall intent expiry and pairing expiry. `maintainRacingContract` must be called by the future controller's own scheduling/connection lifecycle while waiting, not only when chat arrives. Timeout, disconnect or expiry clears work and latches stop. Duplicate/replayed intent sequences cannot be re-admitted; 128 recent IDs and 40 diagnostic lines are retained. No polling or connection scheduler is added to the website.

The fast local controller owns continuous steering, braking, collision avoidance and reactions. Strategic votes never become keyboard spam. This contract's conservative guards are a software boundary, not proof that an actual racing controller is safe or that game-specific observations are correct.

## Reproduce offline

Use Stream Signal → AI Blueprint → Offline contract validator. Validate the sample intent, dispatch its first step, acknowledge, send a new simulated observation and dispatch the second step. Revoke fixture authentication, uncheck track clearance, advance the fixture clock or stop to observe rejection/interruption. Reset is explicit. Nothing contacts a game, chat platform or local service.

Policy tests: `node --test scripts/creator-tools-batch.test.mjs scripts/stream-signal.test.mjs`. Browser evidence and external limits are recorded in `MILESTONE_VERIFICATION.md`. No real peer, process or game control is authorized or started by these checks.
