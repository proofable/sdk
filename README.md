# Proofable MCP

[![npm](https://img.shields.io/npm/v/%40proofable%2Fmcp?label=%40proofable%2Fmcp&color=98C0EF)](https://www.npmjs.com/package/@proofable/mcp)
[![npm downloads](https://img.shields.io/npm/dm/%40proofable%2Fmcp?color=98C0EF)](https://www.npmjs.com/package/@proofable/mcp)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

Give AI access without giving up control.

Add Proofable to any app, chat, or agent that speaks MCP.

`https://mcp.proofable.me/mcp`

## Install

**[One-click install](https://proofable.me/install)** detects the MCP clients on your machine and writes the config for Cursor, VS Code, Claude Code, and Codex; `npx -y @proofable/sdk setup` covers anything else.

Then finish sign-in in your client, and ask:

```text
Show my Proofable profile and current proofs.
```

### Claude Code

In Claude Code, the repository is also a plugin marketplace:

```text
/plugin marketplace add proofable/mcp
/plugin install proofable-mcp@proofable
```

Use either the plugin or a manual entry, not both. The Cursor plugin registers the endpoint; the Claude and Codex plugins ship the skills only, so register the server yourself there and sign in. The skills live in [`plugins/proofable-mcp`](./plugins/proofable-mcp).

## Connect

Two paths, one endpoint, one profile:

- **Interactive sign-in (OAuth):** add the hosted server, then let your client run its own browser sign-in. Best for interactive clients. Only Claude connectors and Devin show a control called Connect; elsewhere the client starts the sign-in itself.
- **Server key:** best for servers, CI, and headless agents. Send it as a Bearer token.

Any MCP client:

```json
{
  "mcpServers": {
    "proofable": { "type": "http", "url": "https://mcp.proofable.me/mcp" }
  }
}
```

Servers and automation:

```json
{
  "mcpServers": {
    "proofable": {
      "type": "http",
      "url": "https://mcp.proofable.me/mcp",
      "headers": { "Authorization": "Bearer ${PROOFABLE_ACCESS_KEY}" }
    }
  }
}
```

Create a key at [Access keys](https://proofable.me/profile?tab=account), then `export PROOFABLE_ACCESS_KEY=npk_...` in that environment.

Or let the installer write the same entry for any tool:

```bash
npx -y @proofable/sdk setup
```

Then ask: "Show my Proofable profile and current proofs."

## What it does

| Job | Tools |
|---|---|
| Load the signed-in profile and workflow | `proofable_context` (call first) |
| Check, reuse, or create proof | `proofable_proofs_check`, `proofable_verify_or_guide`, `proofable_verify`, `proofable_proofs_get`, `proofable_proofs_update`, `proofable_verifiers_catalog` |
| Give agents an owner and permissions | `proofable_agent_link`, `proofable_agent_create`, `proofable_agent_mount` |
| Store secrets without exposing them | `proofable_secret_create`, `proofable_secret_list`, `proofable_secret_revoke` |

Full reference: [docs.proofable.me/mcp/tools](https://docs.proofable.me/mcp/tools).

## Authentication

Two paths, one session model: interactive clients let their client run browser sign-in (OAuth, PKCE, silent refresh); servers and CI send a server key (`npk_...`) as a Bearer token from `PROOFABLE_ACCESS_KEY`. Same endpoint, same Proofable profile, same tools and policy. Never put a key in client config or chat when the client can sign in for you. See [Auth](https://docs.proofable.me/mcp/auth).

## This package

`@proofable/mcp` publishes the registry manifest (`server.json`) and the public skills. It does not run a local server. To build an app against Proofable, start from [github.com/proofable/sdk](https://github.com/proofable/sdk).

```js
import { serverManifest } from '@proofable/mcp';
```

The standards server card (`server.json`, `/.well-known/mcp/server-card.json`) stays OAuth-first.

## Support

- Docs: [docs.proofable.me/mcp/overview](https://docs.proofable.me/mcp/overview)
- Issues: [github.com/proofable/mcp/issues](https://github.com/proofable/mcp/issues)
- Security: [SECURITY.md](./SECURITY.md)
- Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md)

Apache-2.0. Proofable is published by NEUS Network, Inc.
