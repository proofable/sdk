# Setup and project mount

Load this file only when the user needs install, sign-in, access key, or project mount help.

## Install

Register the hosted endpoint on this host, then finish sign-in in the client itself:

`https://mcp.proofable.me/mcp`

If the host already has a Proofable plugin, use the plugin. Do not also write a second `proofable` entry.

If the client shows no sign-in, run its own MCP login command after the URL is registered.

With the Proofable CLI:

```bash
npx -y @proofable/sdk setup
```

Servers and CI:

```bash
npx -y @proofable/sdk setup --access-key <npk_...>
```

Create access keys under **Access keys** on the Account tab of [proofable.me](https://proofable.me/profile?tab=account). Never paste keys into chat or committed files.

After sign-in, call `proofable_context` once and reuse a current proof before starting another verification. Full guide: https://docs.proofable.me/mcp/setup

## Connect an agent to a project

After Proofable is connected on the machine:

```bash
proofable mount <agentId> --apply <host>
```

| Layer | How |
|-------|-----|
| **Machine** | Plugin, install link, or URL-only MCP config. CLI optional. |
| **Project** | `proofable mount <agentId> --apply <host>` |
| **Session** | `proofable_context`, then `proofable_agent_mount` when acting as the agent |

Use `proofable mount` only when acting as a registered profile agent. For proofs and jobs, a completed sign-in plus `proofable_context` is enough.
