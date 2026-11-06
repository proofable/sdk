---
name: proofable-trust-workflow
description: Verifies identity, permissions, and reusable proofs before sensitive assistant actions. Use when confirming authority, loading a trusted agent, scoping what it may do, or when the user asks for Proofable.
license: Apache-2.0
compatibility: Requires a client that supports remote HTTP MCP servers and hosted OAuth.
metadata:
  author: Proofable
  version: "0.1.10"
  homepage: https://docs.proofable.me/mcp/setup
---

# Proofable Trust Workflow

Reuse existing proofs first and verify again only when needed. Summarize as **Proofable**: Passed, Action needed, or Blocked. Never dump raw tool JSON. Answer simple questions directly.

## When to use

- Before sensitive tools, spend, publish, secrets, or agent actions
- When the user asks for Proofable, proofs, agent permissions, or trusted-agent setup
- When acting as a registered profile agent in a project

## If the requirement is not clear, stop

Do not proceed on an assumption. When the requirement, the owner, or the acceptance criteria are not established, ask one question and stop. Confirm the answer against the source that owns it: the contract, the schema, the config, the deployed environment, or the live record. A plausible guess that happens to work is still wrong. A blocked answer is a correct answer, and it costs less than a change nobody can verify.

## Workflow

1. **`proofable_context`** once per session. Prefer signed-in profile context and omit wallet fields on check and verify tools. Call it again only after a profile change.
2. **Profile agent:** **`proofable_agent_mount`** (or `proofable mount <agentId> --apply <host>`) loads identity, permissions, skills, and context.
3. **Trust before action:** call **`proofable_verify_or_guide`** directly, before creating any new proof. It reuses a qualifying proof or returns the next secure step. Use **`proofable_proofs_check`** only for an explicit yes/no eligibility, gate, or access question, never for memory, context, or content retrieval. When signed in, ownership checks continue with **`proofable_verify`**. For another signer, prepare with **`proofable_verify_prepare`** and submit with **`proofable_verify_submit`**. Share a browser link only when a tool returns one.
4. **Agent:** **`proofable_agent_link`**. If the agent already runs elsewhere (a repository, MCP server URL, A2A agent card, or package), import it with `proofable import <source>`. If missing, **`proofable_agent_create`** (a dedicated account needs a key you create and hold; pass only its public address). Then **`proofable_agent_mount`**. Decide `agentWallet` and `controllerWallet` before the first call: a company agent belongs to the org wallet and is never provisioned on the operator's personal wallet to make a call succeed. Re-read with **`proofable_agent_link`**, and only schedule work once **`proofable_context`** shows that agentId with `delegationActive: true` and `execute_jobs` allowed. Ownership, the dispatch chain, and its denial codes: [references/org-owned-agent-identity.md](references/org-owned-agent-identity.md).
5. **Proofs and context:** read the `proofable_context` context index first, then **`proofable_proofs_get`** with a known proof ID and `include=content` for an exact body.
6. **Vault:** **`proofable_secret_list`** / **`proofable_secret_create`** / **`proofable_secret_revoke`**.

## Proofable format

Use the Passed / Action needed / Blocked guidance from `proofable_context`. Never invent proof IDs, verifier IDs, or statuses.

```txt
Proofable: Passed. Requirement satisfied. Proof on file. Next: Continue.
Proofable: Action needed. Missing: <step>. Next: Complete the secure step, then retry.
Proofable: Blocked. A required trust condition was not satisfied. Next: Do not continue until it passes.
```

## Hard rules

- **Ownership is decided once, before the first write.** `agent_create` is idempotent per agentId but not per controller: repeating it with a different `controllerWallet` mints a second identity proof instead of updating the first, so one agentId ends up holding two active identities and mount and dispatch read the newest. If the owner is already right, stop. There is no agent-delete tool; revoking the `agent-identity` and `agent-delegation` proofs is how an agent created on the wrong account is removed, and the ids already quoted to the user then point at revoked records, so say so.
- **Re-creating an agent replaces its record, it does not edit it.** `agent_create` mints a new identity proof for the agentId; the platform tags the prior one `superseded-by` and mount and dispatch read the newest. Any field left out of the call is absent from the new record, so pass the whole record back: label, description, capabilities, instructions and skills. A new identity also orphans a delegation signed against the old one, so the delegation may need re-issuing by the controller before the agent reads as linked.
- **A declared skill resolves only from a proof on the wallet the agent runs on.** The `skills[]` on the identity is a declaration. The text resolves from a proof tagged `skill:<exact id>` held by that wallet, so an agent can declare nine skills and resolve none. `_workspace/tools/agent-skill-sync.mjs` reports the gap per wallet and `--apply` mints what is missing.
- **An action the agent does not need is an action it does not get.** Grant through the explicit allowed list. A preset list is replaced, not extended, so an action left out of the allowed list is denied no matter what the denied list says, and an action removed from the denied list is not thereby granted.
- Proofs stay off the chain unless the user asks for a blockchain record. Do not prompt for a wallet otherwise.
- Use proof IDs only from tool responses. Say "proof ID" or "portable proof" in user text.
- Never ask for a credential, never accept one, never offer to store one, and never echo one. A key is saved on the profile in Proofable, where a run uses it without the value reaching a model or an app. This connection carries no tool that stores a secret. A key or access key pasted into a chat is refused, and the owner is told to rotate it, because the transcript keeps it.
- Use live verifier IDs from **`proofable_context`** / **`proofable_verifiers_catalog`**. Do not hardcode a second catalog.

## Setup and mount

Install, OAuth, access keys, and project mount: [references/setup.md](references/setup.md). Docs: [docs.proofable.me/mcp/setup](https://docs.proofable.me/mcp/setup)
