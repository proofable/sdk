# Proofable SDK

Add verification gates, reusable proof, and agent permissions to your app.

[![npm](https://img.shields.io/npm/v/%40proofable%2Fsdk?label=%40proofable%2Fsdk&color=98C0EF)](https://www.npmjs.com/package/%40proofable%2Fsdk)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

## Start here

Bring the agent you already run. Proofable gives it an ID tied to you and a list of what it may do.

Requires Node.js 20 or later.

**1. Connect and sign in**

```bash
npx -y @proofable/sdk setup
npx -y @proofable/sdk auth --oauth
```

`setup` connects Proofable to the AI tools on this machine.
`auth --oauth` signs this terminal in through your browser.

**2. Import your agent**

```bash
npx -y @proofable/sdk import owner/name --apply claude
```

Point it at a GitHub repository (`owner/name` or its URL) or a folder.
It creates the agent on your profile and writes it into this project.
Name the tool with `--apply`. It takes `cursor`, `claude`, `codex`, `hermes`, `openclaw` or `opencode`, and VS Code uses `cursor`.

**3. Use it**

`import` prints what the agent may do, the files it wrote and the agent's page.
Open this project in that tool. The agent's instructions and permissions are in those files.
Its permissions never expire unless you pass `--expires-at <date>`.

**Or let your coding agent do it**

Paste this into Claude Code, Cursor or Codex.

```text
Set up Proofable for this project. Run `npx -y @proofable/sdk setup`. Then run `npx -y @proofable/sdk auth --oauth` and wait for me to sign in through the browser. Then run `npx -y @proofable/sdk import . --apply <host>`, replacing <host> with claude, cursor or codex to match the tool you run in. Show me what the agent may do and its page link.
```

## Add a check to your app

Verify someone once, then reuse that proof on every later check.

```bash
npm install @proofable/sdk
```

**Send a person to verify**

```js
import { getHostedCheckoutUrl } from '@proofable/sdk';

window.location.assign(getHostedCheckoutUrl({
  verifiers: ['proof-of-human'],
  returnUrl: 'https://app.example.com/auth/callback',
}));
```

The person verifies on Proofable and returns to `returnUrl` with a proof ID (`qHash`). Store it; later decisions read that proof.

**Check the proof on your server**

```js
import { ProofableClient } from '@proofable/sdk';

const result = await new ProofableClient().gateCheck({
  gate: [{ verifierId: 'proof-of-human' }],
  subject: { accountId: user.accountAddress },
});

if (result.satisfied) {
  // Allow the action.
}
```

[Docs](https://docs.proofable.me) | [SDK](https://docs.proofable.me/sdks/javascript) | [CLI](https://docs.proofable.me/sdks/cli) | [MCP](https://docs.proofable.me/mcp/overview) | [API](https://docs.proofable.me/api/overview) | [Examples](https://docs.proofable.me/use-cases/gate-access)

## Combine checks in a gate

Define a gate when the decision needs several checks.

```js
import { ProofableClient, defineGate } from '@proofable/sdk';

const proofable = new ProofableClient();
const gate = defineGate([
  { verifierId: 'proof-of-human' },
  { verifierId: 'ownership-dns-txt', match: [{ path: 'domain', value: 'acme.com' }] },
]);

const result = await proofable.gateCheck({ gate, subject });
```

A published `gateId` is optional; use one when you need a persisted listing, price, or schedule. Never ship access keys in browser code.

## Gate a React page

```jsx
import { VerifyGate } from '@proofable/sdk/widgets';

<VerifyGate gate={[{ verifierId: 'proof-of-human' }]} onVerified={grantAccess} />;
```

## Connect an editor or agent host

Interactive clients add `https://mcp.proofable.me/mcp`, click **Connect**, and sign in. Servers and CI send a server key from `PROOFABLE_ACCESS_KEY` as a Bearer token.

```bash
npx -y @proofable/sdk setup --access-key $PROOFABLE_ACCESS_KEY
npx -y @proofable/sdk import <github-url|owner/name|folder> --dry-run
npx -y @proofable/sdk mount <agentId> --apply <host>
npx -y @proofable/sdk doctor --live
```

`import` also reads an MCP server URL or an A2A agent card.
`--dry-run` shows what it would create. `--no-mount` creates the agent without writing it into the project.
A terminal that is not signed in gets a browser link instead.

`mount` writes an agent you already have into this project for another tool. Setup steps: [docs.proofable.me/mcp/setup](https://docs.proofable.me/mcp/setup).

## Core methods

| Method | Use it for |
| ------ | ---------- |
| `getHostedCheckoutUrl()` | Send a user to Hosted Verify |
| `client.verify()` | Create a proof (in-app signing) |
| `client.verifyFromApp()` | Create a proof for an approved user (server; needs appId + origin) |
| `client.getProof()` | Fetch a public proof by its proof ID (`qHash`) |
| `client.getPrivateProof()` | Fetch a private proof (wallet-bound) |
| `client.pollProofStatus()` | Wait for async verification to complete |
| `client.getProofsByWallet()` | List a wallet's public proofs |
| `client.getPrivateProofsByWallet()` | List a wallet's private proofs |
| `client.gateCheck()` | Server-side eligibility check before access |
| `client.checkGate()` | Local preview against already-loaded proofs |
| `client.getGate()` | Read a published gate's requirements and charge |
| `client.fulfillGate()` | Deliver a post-verify reward for hosted checkout |
| `client.createGatePrivateAuth()` | Signed proof for private gate access |
| `client.revokeOwnProof()` | Revoke a proof you own |
| `client.createWalletLinkData()` | Wallet-link payloads |
| `client.getVerifiers()` | List live verifier ids |
| `client.getVerifierCatalog()` | Full verifier catalog with access levels |
| `client.isHealthy()` | Ping the API health endpoint |

```js
import { ProofableClient } from '@proofable/sdk';

const client = new ProofableClient({
  apiUrl: 'https://api.proofable.me',
  timeout: 30000
});
```

`apiKey` (`npk_*`) is server-side only. `appId` is optional public attribution for server flows; published gate checkout and `gateCheck({ gateId })` work without it.

Issues: [github.com/proofable/sdk/issues](https://github.com/proofable/sdk/issues). Security: [SECURITY.md](./SECURITY.md). Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md).

Apache-2.0. Published by NEUS Network, Inc.
