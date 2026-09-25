# Changelog

All notable changes to the Proofable SDK and CLI are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Product release notes: [docs.proofable.me/changelog](https://docs.proofable.me/changelog).

## [0.1.2] - 2026-09-24

### Changed

- **Delegation authority follows the canonical action contract.** `getHostedAgentCreateUrl` and `verify` no longer accept or forward `scope` and `permissions`. Authority is `allowedActions` minus `deniedActions` only; spend delegations carry `allowedPaymentTypes` and `maxSpend`, and `allowedOrigins` bounds app-agent origins. Runtime mounts surface `allowedActions`/`deniedActions` without a scope string.
- **Trust guidance follows the hosted workflow.** The packaged trust-workflow skill and runtime-mount trust instructions use `proofable_verify_or_guide` first; `proofable_proofs_check` is only for an explicit yes/no eligibility, gate, or access question.
- **The packaged `proofable-setup` skill ships with the SDK.** Published skills are generated from the canonical `proofable/mcp` `skills/` directory; CI verifies parity so the two packages can never publish different skill content.

### Upgrade

```bash
npm install @proofable/sdk@0.1.2
```

`scope` and `permissions` are removed. Pass `allowedActions` (and `deniedActions` to exclude); pass `allowedPaymentTypes` with `maxSpend` for spend authority.

## [0.1.1] - 2026-09-13

### Added

- **One description for the package.** npm and the README share one description: SDK and CLI for verification gates, reusable proof, and agent permissions.
- **Inline Gate Policy.** `defineGate` plus `gateCheck({ gate, subject })` evaluates a visitor by account without a published listing or a Proofable profile. `POST /api/v1/proofs/check` is the server path.
- **Subject reuse.** `VerifyGate` accepts `subject` and reuses public or unlisted proofs for that account without requiring a connected wallet or Proofable sign-in.
- **x402 quotes on API errors.** `ApiError.fromResponse` keeps `PAYMENT-REQUIRED` on HTTP 402 so callers can settle and retry with `PAYMENT-SIGNATURE`.
- **Generic MCP config builder.** `buildGenericMcpJsonConfig` and `buildGenericMcpJsonConfigUrlOnly` from `@proofable/sdk/mcp-hosts` produce the copy-paste `mcpServers` JSON block for any MCP client. URL-only output is the OAuth path; an `npk_*` Profile access key becomes a static `Authorization: Bearer` header.

### Changed

- **README opens with install and a runnable gate.** The hosted MCP URL, `npx -y @proofable/sdk setup`, and a `defineGate` / `gateCheck` example lead the page.
- **The install host list renamed for what it is.** `MCP_INSTALL_HOSTS` is now `MCP_INSTALL_SHORTCUT_HOSTS`. The four entries (cursor, claude, codex, vscode) are deep-link conveniences, not the compatibility boundary.

### Upgrade

```bash
npm install @proofable/sdk@0.1.1
```

`gateCheck({ gateId })` still works for published listings. New apps should use `defineGate` and `subject`.

## [0.1.0] - 2026-09-06

First Proofable SDK and CLI release. The predecessor `@neus/sdk` 1.x releases remain on npm as history.

### Added

- **Library**. Hosted verification flows, reusable proof checks, server gate checks, React widgets, and agent permissions, implementing [CAIP-380 Portable Proof](https://docs.proofable.me/learn/standards/caip-380).
- **CLI**. `proofable setup`, `proofable doctor --live`, `proofable auth`, and `proofable mount` for hosted MCP setup and agent context.
- **`proofable setup`** support for hosted MCP clients. Cursor, Claude Code, Codex, and VS Code register `https://mcp.proofable.me/mcp` and sign in with hosted OAuth.
- **Widgets**. `VerifyGate` and `ProofBadge` from `@proofable/sdk/widgets`.

### Changed

- **Package identity.** `@neus/sdk` is now `@proofable/sdk`. The CLI binary is `proofable` (was `neus`).
- **SDK exports.** `NeusClient` is now `ProofableClient`. `NEUS_*` exports are now `PROOFABLE_*`. `buildNeusMcpHttpConfig` is now `buildMcpHttpConfig`.
- **Environment.** `PROOFABLE_ACCESS_KEY` is the server and CI environment variable (was `NEUS_ACCESS_KEY`).
- **Local state.** The CLI token store moved from `~/.neus/` to `~/.proofable/`, and `proofable mount` writes `.proofable/mount.json` (was `.neus/mount.json`). Sign in once after upgrading.

### Upgrade

```bash
npm install @proofable/sdk
npx -y @proofable/sdk setup
npx -y @proofable/sdk doctor --live
```

Full rename map and stale-state fixes: [Migration guide](https://docs.proofable.me/migrate).

<!-- Historical archive: the predecessor @neus/sdk package this release replaces. -->
<!-- Full release-by-release notes: https://github.com/proofable/network/blob/neus-final/CHANGELOG.md -->
<!-- npm: https://www.npmjs.com/package/@neus/sdk -->

## History: @neus/sdk

The `@proofable/sdk` package continues the line published as `@neus/sdk`. The notes below are the user-facing highlights of each predecessor release. The complete record stays with the predecessor package on npm and in the archived source at [proofable/network](https://github.com/proofable/network) under the `neus-final` tag.

| Release | Date | What it changed for a builder |
| --- | --- | --- |
| [1.3.9](https://www.npmjs.com/package/@neus/sdk/v/1.3.9) | 2026-08-13 | Removed the OAuth browser command-injection sink: the CLI opens authorization URLs with fixed executables, never a shell command. Retired the `neus import` / `neus export` / `neus revoke` alias paths. The CLI defers skill install when the plugin already bundles the trust workflow. |
| [1.3.8](https://www.npmjs.com/package/@neus/sdk/v/1.3.8) | 2026-07-30 | Added RFC 9207 issuer validation in `neus setup` and `neus auth`, preventing authorization-code interception. Rebalanced per-host setup guidance and removed the retired `neus-trust` plugin probe. |
| [1.3.7](https://www.npmjs.com/package/@neus/sdk/v/1.3.7) | 2026-07-30 | Restored marketplace click-install for Cursor and normalized the RFC 8707 `resource` parameter so canonicalizing clients stop failing with `invalid_target`. |
| [1.3.6](https://www.npmjs.com/package/@neus/sdk/v/1.3.6) | 2026-07-30 | The `neus-mcp` plugin became the MCP registration owner in Cursor while the CLI defers, ending duplicate entries. The trust-workflow skill moved into the package as its single home. |
| [1.3.5](https://www.npmjs.com/package/@neus/sdk/v/1.3.5) | 2026-07-21 | Aligned the optional ZKPassport dependency (0.16.1) with the hosted verifier runtime patch. |
| [1.3.4](https://www.npmjs.com/package/@neus/sdk/v/1.3.4) | 2026-07-21 | Added offline portable-proof verification (EIP-191, Ed25519, provider-backed EIP-1271) with strict canonical JSON, exact signed-data binding, and a CAIP-380 interoperability fixture. |
| [1.3.3](https://www.npmjs.com/package/@neus/sdk/v/1.3.3) | 2026-07-16 | ZKPassport 0.16 alignment. `neus setup` warns when both the plugin and a manual `neus` entry are present. `neus doctor --live` reports handle, wallet, proof count, and mounted agent. Tag pushes now publish matching GitHub Releases. |
| [1.3.2](https://www.npmjs.com/package/@neus/sdk/v/1.3.2) | 2026-07-09 | Restored one-click Cursor marketplace install (the plugin again ships the required MCP config). Sharpened the trust-workflow skill and aligned docs and examples with the live assistant guidance. |
| [1.3.1](https://www.npmjs.com/package/@neus/sdk/v/1.3.1) | 2026-07-08 | `neus mount` and `@neus/sdk/runtime-mount` became the supported path for loading a Trusted Agent into a project. |
| [1.3.0](https://www.npmjs.com/package/@neus/sdk/v/1.3.0) | 2026-07-08 | Added `llms.txt` and `pricing.txt` for AI search, opened docs to AI crawlers, published the Codex plugin metadata, and tightened the public SDK surface to documented integrator exports. |
| [1.2.5](https://www.npmjs.com/package/@neus/sdk/v/1.2.5) | 2026-07-03 | One plugin install path for every editor: Cursor, Claude Code, Codex, and VS Code, with a refreshed marketplace mark. |
| [1.2.4](https://www.npmjs.com/package/@neus/sdk/v/1.2.4) | 2026-06-23 | SDK, MCP server, plugin, and trust-workflow skill report one version: 1.2.4. |
| [1.2.3](https://www.npmjs.com/package/@neus/sdk/v/1.2.3) | 2026-06-21 | VS Code joined `neus setup` and the install docs. `neus doctor --live` works with browser OAuth sessions, and a sign-in challenge counts as reachable, not down. |
| [1.2.2](https://www.npmjs.com/package/@neus/sdk/v/1.2.2) | 2026-06-21 | OAuth docs now match the real editor sign-in flow, and Cursor setup stopped warning about a stale local token format. |
| [1.2.1](https://www.npmjs.com/package/@neus/sdk/v/1.2.1) | 2026-06-18 | Clean installs include the CLI and agent-context modules, and Node-only adapters left the main entry point for browser builds. |
| [1.2.0](https://www.npmjs.com/package/@neus/sdk/v/1.2.0) | 2026-06-18 | Added agent context mount: `neus mount <agentId>` writes project context for Cursor, Claude Code, or Codex, and `@neus/sdk/runtime-mount` plus `runtime-adapters` expose it to apps. |
| [1.1.7](https://www.npmjs.com/package/@neus/sdk/v/1.1.7) | 2026-06-16 | Fixed gate checkout paths and proof revocation response parsing. |
| [1.1.6](https://www.npmjs.com/package/@neus/sdk/v/1.1.6) | 2026-06-12 | Fixed a Node ESM crash in `neus auth` browser sign-in. `neus setup --oauth` forces browser sign-in even when an access key is present. |
| [1.1.5](https://www.npmjs.com/package/@neus/sdk/v/1.1.5) | 2026-06-07 | One install path across README, install, MCP, plugin, and SDK, leading with portable proofs. Removed the redundant per-host install files. |
| [1.1.3](https://www.npmjs.com/package/@neus/sdk/v/1.1.3) | 2026-06-05 | Install docs start from hosted MCP setup with platform cards, and the Claude Code plugin loads the trust workflow skill correctly. |
| [1.1.2](https://www.npmjs.com/package/@neus/sdk/v/1.1.2) | 2026-06-04 | Added `@neus/sdk/mcp-hosts` helpers for MCP install URLs, setup commands, and editor deep links. `neus import --from auto` prefers Claude Code, Cursor, and Claude Desktop. |
| [1.1.1](https://www.npmjs.com/package/@neus/sdk/v/1.1.1) | 2026-05-28 | `neus_context` returns the current profile when connected, and `neus setup` writes the correct config path for each editor. |
| [1.1.0](https://www.npmjs.com/package/@neus/sdk/v/1.1.0) | 2026-05-26 | First public SDK release on npm: OAuth-first setup, the CLI, public MCP tools including encrypted Vault secrets, and the Claude Code plugin with the trust workflow skill. |
| [1.0.12](https://www.npmjs.com/package/@neus/sdk/v/1.0.12) | 2026-05-26 | First `@neus/sdk` release with the hosted MCP CLI (`neus setup`, `neus auth`, import/export) and the OAuth browser flow. |

<!--
Media placeholders for this release line. Drop the finished files under docs/images/releases/ and swap each comment for the matching <img> / <Video> include.
-->

<!--
<update-image-0.1.1>
  TODO: screenshot — defineGate + gateCheck in an app: the gate panel before and after a proof is reused.
  Suggested path: docs/images/releases/sdk-0.1.1-define-gate.png
</update-image-0.1.1>
-->

<!--
<update-image-0.1.0>
  TODO: screenshot — npx -y @proofable/sdk setup registering the endpoint in a host.
  Suggested path: docs/images/releases/sdk-0.1.0-setup.png
</update-image-0.1.0>
-->

[Unreleased]: https://github.com/proofable/sdk/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/proofable/sdk/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/proofable/sdk/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/proofable/sdk/releases/tag/v0.1.0