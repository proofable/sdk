---
name: proofable-setup
description: Add Proofable to any MCP client, sign in, and reuse profile, proofs, listings, and agents.
license: Apache-2.0
compatibility: Requires an MCP-capable client that can register a remote HTTP server.
metadata:
  author: Proofable
  version: "0.1.7"
  homepage: https://docs.proofable.me/mcp/setup
---

# Set up Proofable

Add this hosted endpoint to your MCP client, then finish the sign-in it opens:

`https://mcp.proofable.me/mcp`

If the client offers the Proofable plugin, install it instead of adding the URL by hand. Keep one Proofable connection per client.

With the Proofable CLI:

```bash
proofable setup
```

After sign-in, ask:

```text
Show my Proofable profile and the proofs I can reuse.
```

Call `proofable_context` once. Do not fetch every proof body. Summarize the result as Passed, Action needed, or Blocked.

For a specific requirement, ask:

```text
Check whether I already have the proof needed for this task. Reuse it if it qualifies; otherwise show me the next step.
```

For agents, ask:

```text
Show what my agents are allowed to do.
```

The agent lives on the signed-in profile by default. Ask for a dedicated spend account only when the agent should pay from its own account. Open **Connections** on proofable.me to link apps.

Already running an agent? Bring it as it is: a GitHub repository, an MCP server URL, an A2A agent card, or a package. Secrets stay out of the import.

```bash
proofable import <repository, URL, or folder>
```

It prints a link to register the agent's identity. To let others run the agent as a service, create an AI service listing at https://proofable.me/profile/portals/new.

Optional project mount (`cursor`, `claude`, `codex`, `hermes`, `openclaw`, or `opencode`; VS Code uses `cursor`):

```bash
proofable mount <agentId> --apply cursor
```

Full guide: https://docs.proofable.me/mcp/setup
