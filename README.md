# Proofable SDK

Add verification gates, reusable proof, and agent permissions to your app.

[![npm](https://img.shields.io/npm/v/%40proofable%2Fsdk?label=%40proofable%2Fsdk&color=98C0EF)](https://www.npmjs.com/package/%40proofable%2Fsdk)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

Verify someone once. Check that proof forever after.

## Start here

**Any MCP client**

`https://mcp.proofable.me/mcp`

**Install**

```bash
npm install @proofable/sdk
```

**Verify a person in three lines**

```js
import { getHostedCheckoutUrl } from '@proofable/sdk';

window.location.assign(getHostedCheckoutUrl({
  verifiers: ['proof-of-human'],
  returnUrl: 'https://app.example.com/auth/callback',
}));
```

They verify on Proofable, return with a proof ID (`qHash`), and every future decision reads that proof. No UI to build. No gate to define.

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

**Docs**

https://docs.proofable.me

[SDK](https://docs.proofable.me/sdks/javascript) | [CLI](https://docs.proofable.me/sdks/cli) | [MCP](https://mcp.proofable.me/mcp) | [API](https://docs.proofable.me/api/overview) | [Examples](https://docs.proofable.me/use-cases/gate-access) | [Docs](https://docs.proofable.me)

Requires Node.js 20 or later. Full CLI setup: `npx -y @proofable/sdk setup`.

## When one check becomes a gate

One check is not a gate. Reach for a gate when the decision needs several checks, a price, or a schedule.

```js
import { ProofableClient, defineGate } from '@proofable/sdk';

const proofable = new ProofableClient();
const gate = defineGate([
  { verifierId: 'proof-of-human' },
  { verifierId: 'ownership-dns-txt', match: { domain: 'acme.com' } },
]);

const result = await proofable.gateCheck({ gate, subject });
```

A published `gateId` is optional and only for a persisted listing, price, or schedule. Never ship access keys in browser code.

## Gate a React page

```jsx
import { VerifyGate } from '@proofable/sdk/widgets';

<VerifyGate gate={[{ verifierId: 'proof-of-human' }]} onVerified={grantAccess} />;
```

## Connect an editor or agent host

Interactive clients add `https://mcp.proofable.me/mcp`, click **Connect**, and sign in. Servers and CI send a server key as a Bearer token from `PROOFABLE_ACCESS_KEY`.

```bash
npx -y @proofable/sdk setup
npx -y @proofable/sdk setup --access-key $PROOFABLE_ACCESS_KEY
npx -y @proofable/sdk mount <agentId> --apply <host>
npx -y @proofable/sdk doctor --live
```

`--apply` accepts `cursor`, `claude`, `codex`, `hermes`, `openclaw`, or `opencode`. VS Code uses `--apply cursor`. Setup steps: [docs.proofable.me/mcp/setup](https://docs.proofable.me/mcp/setup).

## Core methods

| Method | Use it for |
| ------ | ---------- |
| `getHostedCheckoutUrl()` | Send a user to Hosted Verify |
| `client.verify()` | Create a proof (in-app signing) |
| `client.verifyFromApp()` | Create a proof for an approved user (server; needs appId + origin) |
| `client.getProof()` | Fetch a public proof by its proof ID (`qHash`) |
| `client.getPrivateProof()` | Fetch a private proof (wallet-bound) |
| `client.pollProofStatus()` | Wait for async verification completion |
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

`appId` is optional public attribution for advanced server flows. Published gate checkout and `gateCheck({ gateId })` do not require it. `apiKey` (`npk_*`) is server-side only.

Issues: [github.com/proofable/sdk/issues](https://github.com/proofable/sdk/issues). Security: [SECURITY.md](./SECURITY.md). Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md).

Apache-2.0. Published by NEUS Network, Inc.
