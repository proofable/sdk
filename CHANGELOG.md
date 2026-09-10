# Changelog

All notable changes to the Proofable SDK and CLI are documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Product release notes: [docs.proofable.me/changelog](https://docs.proofable.me/changelog).

## [Unreleased]

(nothing yet)

## [0.1.0] - 2026-09-06

First Proofable SDK and CLI release. The predecessor `@neus/sdk` 1.x releases remain on npm as immutable history.

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

### Links

- [Install](https://docs.proofable.me/mcp/setup)
- [Migrate from @neus](https://docs.proofable.me/migrate)
- [npm: @proofable/sdk](https://www.npmjs.com/package/@proofable/sdk)