# Account deletion lifecycle status

Updated: 2026-08-22 (America/Los_Angeles)

## Done

- Isolated worktree: `/Users/nubs/.codex/worktrees/bc7e/eliza`; branch: `codex/account-deletion-lifecycle-23098`.
- Exact starting base: `origin/develop@d54d91ea36d217ad8d1bf2c1d47b7dcd91183111`. Preserved detached snapshot `e58da6bfe0495709dc4844c30e39b32d706e8590`; no reset, clean, push, deploy, or other-worktree mutation.
- Lifecycle-authority checkpoint: `d9061c1e08b3f30f1f971464687577481094585a`, tag `account-deletion-lifecycle-authority-20260822`.
- Encrypted-export contract checkpoint: `496d77baefc5ef57cfe6a900be572c374883382b`, tag `account-deletion-encrypted-export-contract-20260822`.
- Generic public UI checkpoint: `c71a5932c886141c618d3c2b1daea5f2c34b6675`, tag `account-deletion-public-ui-20260822`.
- Replayed current-develop contract: `f36c6fd1d37b123f388a0d89ffaed1990be22ec8`, tag `account-deletion-encrypted-export-contract-current-develop-20260822`.
- Exact current-develop export/UI candidate: `98dcb1baacc6b72402fdd855c8957e775cb1d7f2`, tag `account-deletion-export-ui-candidate-20260822`; parent base `origin/develop@a40cc65d3f`.
- Durable saga/cancellation checkpoint: `00e8008de9a308eb6da58614a14c770bb8250f9f` (tagged by the following ledger checkpoint as `account-deletion-fenced-saga-20260822`).
- Restart-safe cancellation reconciliation: `5b1e51e7b098449fe38ac991d4af8cc63286e715`.
- Domain-renewal lifecycle fence: `e996bef3b0f6dddff403bca56dc0c766a70b311c`.
- Audited issue #23098, merged fail-closed PR #22854 / `c276ccf007dd8f1e6102b8d5799b5ec6109394ef`, UI-only draft PRs #24253/#24256, applicable repository/package guides, schema ownership, and current migration tail.
- Claimed the Cloud/Security implementation lane on issue #23098: https://github.com/elizaOS/eliza/issues/23098#issuecomment-5378961151.
- Classified all 215 direct user/organization foreign-key edges with a fail-closed digest-pinned runtime policy: 69 external reconciliation, 10 shared transfer, remaining cascade/anonymize; unknown restrictive edges fail tests. Digest: `15534d017ba7c2a8414b4831ded62b8fe6256daca279115c56c48eacf62e0e3a`.
- Published four separate typed operations: agent stop/wake, subscription cancellation, shared-member exit/ownership transfer, and personal account deletion.
- Reconciled the append-only migrations after upstream `0299_synthetic_environment_leases`: `0300_account_deletion_lifecycle_authority`, `0301_account_deletion_phase_receipts`, and `0302_account_deletion_exports`; journal idx 283-285. Historical `0276_account_deletion_requests` remains intact.
- Implemented primary-writer organization/user/request locking; one durable request receipt; lifecycle revision; immediate fences for sessions, API keys, auto-top-up, paid work, and account authority; generation-fenced saga phase receipts; separate opaque status and recovery capabilities. Concurrent replays cannot rotate the first committed capabilities.
- Implemented exact confirmation, recent direct Steward auth, origin checks, fail-closed rate limiting, authenticated and public request paths, no-store credential responses, post-session status, recovery-window undo, and Steward deactivation/reactivation reconciliation.
- Shared personal deletion fails with actionable `TRANSFER_REQUIRED` and does not mutate shared tenant authority.
- Implemented the bounded portable export: one repeatable-read/read-only PostgreSQL snapshot, complete runtime FK inventory, deterministic ordering, recursive credential redaction (including camelCase provider fields), 100,000-row per-table preflight, 32 MiB aggregate/source/serialized limits, and fail-closed oversized handling.
- Export objects use AES-256-GCM with request-digest AAD, a recovery-capability-derived key, an opaque digest-only object key, immutable R2 `If-None-Match: *`, ciphertext/content digests, read-back verification, and atomic generation-fenced database completion.
- Lost object-write responses enter `reconciling`; a later generation reads and verifies the existing object before committing and never repeats the put. Confirmed provider absence is the only path back to a build retry.
- Cancellation and expiry schedule an `export_revoke` receipt after a 15-minute safety delay that outlives the five-minute export lease. R2 delete success with a lost response is reconciled by confirmed absence without repeating delete; completion atomically nulls content/size and records only the deletion receipt digest.
- Added final-boundary auto-top-up lifecycle/revision checks before authorization and immediately before Stripe.
- Domain renewals now capture active lifecycle authority before debit and recheck the exact revision immediately before Cloudflare. A revision/state change refunds the debit and returns `lifecycle_fenced` without calling the registrar.
- Preserved the legacy due-worker `LIFECYCLE_RESERVATION_REQUIRED` fence; irreversible personal erasure is not enabled prematurely.
- Added ordered generation-fenced provider phases, durable before-call markers, immutable idempotency keys, retry classes, leases, canonical-state reconciliation, and transactional terminal erasure with identifier nulling. A lost provider response is inspected before any later mutation; an inspection outage remains reconciling.
- Added a distinct nonterminal `canceling` state. Cancellation keeps organization/user/auth/paid-work fences active and leaves existing sessions and API keys revoked. Only completed `steward_reactivation` and `export_revoke` receipts permit a locked lifecycle-revision increment and terminal `canceled` publication.
- Proved that concurrent expiry workers publish irreversible authority once, cancellation cancels an in-flight phase generation, and its stale provider callback cannot restore or overwrite cancellation authority.
- Cancellation reactivation now resumes after process restarts: a reconciling worker inspects canonical Steward state before mutation, commits an already-active identity without replay, and requires a later generation after confirmed non-effect. The loopback Steward mock now exposes the same GET inspection and true deactivate/reactivate semantics.

## Android/shared contract handoff

- Current-develop contract source: `f36c6fd1d37b123f388a0d89ffaed1990be22ec8` (`account-deletion-encrypted-export-contract-current-develop-20260822`). The original pre-replay handoff remains preserved at `496d77baefc5ef57cfe6a900be572c374883382b`.
- Typed contract: `packages/cloud/shared/src/types/account-lifecycle.ts` exports `AccountDeletionAcceptedDto`, `AccountDeletionStatusDto`, status/export enums, next actions, conflict codes, and the four operation contracts.
- `POST /api/v1/me/account-deletion`: recent authenticated session, same-origin mutation, exact JSON `{ "confirmation": "DELETE" }`; returns `202 AccountDeletionAcceptedDto` only for the initial accepted reservation.
- `POST /api/public/account-deletion`: external recently authenticated request path with the same exact confirmation and accepted DTO.
- `GET /api/public/account-deletion`: post-session status via `X-Account-Deletion-Status`; URL parameters are never authority.
- `DELETE /api/public/account-deletion`: recovery undo via separate `X-Account-Deletion-Recovery` and exact JSON `{ "confirmation": "CANCEL DELETION" }`.
- `POST /api/public/account-deletion/export`: recovery export via `X-Account-Deletion-Recovery` and exact JSON `{ "confirmation": "EXPORT MY DATA" }`; returns verified JSON bytes plus `X-Account-Deletion-Export-SHA256` and attachment disposition.
- Clients must retain the two opaque capabilities separately before ordinary logout, never place them in a URL/log/telemetry payload, never infer success from redirects/query parameters, and verify the download SHA-256 before presenting success.
- Stable cancellation DTO rule from `00e8008de9`: `status: "canceling"`, `accessState: "fenced"`, `canCancel: false`, and `nextAction: "wait_for_reconciliation"` are nonterminal. Only `status: "canceled"`, `accessState: "active"`, and `nextAction: "none"` are terminal. Android/web must not infer terminal cancellation from the HTTP mutation response alone; poll the opaque status capability.

## Doing

- The bounded encrypted export/download, recovery capability, generic public page, durable saga authority, and cancellation contract are locally checkpointed. Preserve exact saga checkpoint `00e8008de9a308eb6da58614a14c770bb8250f9f` for continued isolated work.
- Default adapters now cover Steward, Stripe, domains, backup catalogue objects, compute/containers, GitHub/apps, connector OAuth, voice credentials, primary object storage, Vault bindings, and discovered grants. Remote spool authority, environment wiring for both backup stores, full-schema erasure proof, and disposable staging absence evidence remain open and fail closed.

## Next

1. Coordinate exact source `00e8008de9a308eb6da58614a14c770bb8250f9f` with Android for the typed `canceling`/`accessState` parser update; no Android files were edited here.
2. Continue focused provider adapter, lifecycle-boundary, full-schema terminal erasure, and restart reconciliation proof only within #23098 authority; do not weaken the legacy fail-closed fence.
3. Exercise disposable staging fixtures and final-absence proof only after source serialization.
4. Produce rollout/rollback/runbook, focused draft PR metadata, and the Cloud/Security/SRE/Steward/billing/provider reviewer matrix.

## Reused prior work

- Reused content from #22854: base request receipt, resource-purge helpers, primary-writer erasure foundation, Steward helpers, app/sandbox/voice cleanup hooks, cron entry, and local E2E harness.
- Recovered prior request/export/receipt patterns by content and tests; the deliberate guard was not reverted.
- #24253/#24256 remain truthful unavailable-state UI drafts only; this lane supplies the backend/shared/public contract without mutating those branches.

## Tests and evidence

- Exact-head focused backend/migration proof: 47/47 pass: export 7, lifecycle service 11, real PGlite reservation/concurrency/export fencing 6, full-schema FK policy 3, migration application 3, migration journal 5, public status/request/undo route 6, authenticated route 3, export route 3.
- Saga/cancellation checkpoint proof: 32/32 pass across public route 6, provider saga lost-response/stale-generation 3, lifecycle service 11, migration application 4, and real PGlite reservation/cancellation/expiry concurrency 8; 134 assertions. Cloud shared typecheck and Cloud API typecheck/production Worker dry-run pass.
- Restart-safe cancellation proof: lifecycle/PGlite focused suites 21/21 pass with 103 assertions; Cloud shared, Cloud test-mocks, and Cloud API typechecks pass, including the Worker dry-run bundle.
- Domain renewal boundary proof: 12/12 pass with 37 assertions, including pre-debit deletion fencing and post-debit revision-change refund/no-provider-call; Cloud shared typecheck passes.
- Correct Vitest UI client command passes 5/5. Direct Bun execution of that Vitest file fails before tests because Bun's compatibility layer lacks `vi.hoisted`; this is a runner mismatch, not a product failure.
- Generic UI/client: 16/16 pass under Vitest, including capability persistence, no query-parameter authority, exact undo/export confirmations, and client-side SHA-256 mismatch rejection.
- Focused Biome check across all changed backend/UI files: pass.
- Cloud shared typecheck: pass.
- Cloud API typecheck and production Worker dry-run bundle: pass after replaying onto `origin/develop@a40cc65d3f`.
- UI-wide typecheck has one unchanged environment baseline failure at `packages/ui/src/bridge/storage-bridge.ts:53`: missing `@elizaos/capacitor-secure-store` type/module; focused UI tests are clean.
- Direct Bun execution is not a valid runner for the two Vitest UI files because Bun lacks `vi.hoisted`; the correct Vitest run passes 16/16.
- The repository's coverage-enabled Bun PGlite run passes assertions but its coverage writer can fail with Bun `WriteFailed`; the identical suite passes 6/6 with an explicit disposable no-coverage Bun config.
- The broad app-view audit was stopped after 47 green captures/tests to prioritize the atomic backend handoff. The correct focused Cloud audit was rerun at exact candidate head and passed `/account-deletion` at desktop and mobile: 2/2, no console errors, banned blue, hover violations, or screenshot-quality issues. Both exact-head captures were manually inspected and found readable with no visible overflow/layout break.
- Earlier Drizzle generation was blocked before generation by existing `ERR_PACKAGE_PATH_NOT_EXPORTED` for `packages/core/node_modules/@elizaos/prompts/package.json`; migrations were reviewed append-only and independently applied in isolated PGlite.
- Staging mutations, provider calls, production mutations, real-user/account deletion, push, merge, deploy, and PR/Play state changes: none.

## Remaining gates

- The saga authority and default adapter candidate are committed, but backup-store environment wiring, remote spool proof, comprehensive provider-specific failure tests, full-schema terminal erasure, and isolated-staging final-absence proof remain open under issue #23098.
- Full authenticated recovery/export interaction recording still requires a disposable staged account; the anonymous external route has focused desktop/mobile visual proof.
- Disposable staging source/deploy serialization with the shared staging owner and canonical non-production fixtures.
- Independent Cloud, Security, SRE, Steward, billing, and provider-owner review.
- No production deployment, migration, push, merge, or real-user deletion is authorized.
