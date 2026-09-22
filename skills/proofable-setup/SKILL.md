---
name: proofable-setup
description: Add Proofable to any MCP client, sign in, and reuse profile, proofs, listings, and agents.
license: Apache-2.0
compatibility: Requires an MCP-capable client that can register a remote HTTP server.
---

# Set up Proofable

Give AI agents verified identity, scoped permissions, and reusable proof through one MCP.

Add Proofable to any app, chat, or agent that speaks MCP. Cursor, Claude, Codex, and VS Code are shortcuts.

Install Proofable, then click **Connect**:

`https://mcp.proofable.me/mcp`

If the host offers the Proofable plugin, install it and click **Connect** instead of adding the URL by hand. Do not add a second `proofable` entry.

Have the CLI?

```bash
proofable setup
```

After Connect, ask:

```text
Show my Proofable profile and current proofs.
```

Do not fetch every proof as the first step. Summarize as Passed, Action needed, or Blocked.

Then, if you need agents:

```text
Show what my agents are allowed to do.
```

The agent lives on the signed-in profile by default. Ask for a dedicated spend account only when the agent should pay from its own account. Open **Connections** on proofable.me to link apps.

To sell: set payouts at https://proofable.me/profile?tab=credits, then create a listing at https://proofable.me/profile/portals/new.

Full page: https://docs.proofable.me/mcp/setup

Optional project mount (`cursor`, `claude`, `codex`, `hermes`, `openclaw`, or `opencode`; VS Code uses `cursor`):

```bash
proofable mount <agentId> --apply cursor
```
