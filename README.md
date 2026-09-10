# Proofable SDK

[![npm](https://img.shields.io/npm/v/%40proofable%2Fsdk?label=%40proofable%2Fsdk&color=98C0EF)](https://www.npmjs.com/package/@proofable/sdk)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)

JavaScript SDK and CLI for AI agent permissions, identity verification, and reusable proof. Check what a user or agent may do before access, payment, or action, and reuse the proof instead of repeating the check.

Requires Node.js 20 or later.

## Install

```bash
npm install @proofable/sdk
```

## Check access on your server

Use `gateCheck` from trusted server code before access:

```js
import { ProofableClient } from '@proofable/sdk';

const client = new ProofableClient();

const result = await client.gateCheck({
  gateId: 'gate_your-app-name',
  address: '0x...'
});

if (result.data?.gate?.allRequiredSatisfied !== true) {
  throw new Error('Access denied');
}
```

Never ship access keys in browser code.

## Send users to Hosted Verify

Hosted Verify handles signing outside your app. Prefer a published gate:

```js
import { getHostedCheckoutUrl } from '@proofable/sdk';

const url = getHostedCheckoutUrl({
  gateId: 'gate_your-app-name',
  returnUrl: 'https://yourapp.com/auth/callback'
});

window.location.assign(url);
```

After completion, Proofable redirects back with a proof ID in the `qHash` field. Store it with your user or record.

To set up a dedicated agent, keep its signed identity step separate from the approving account:

```js
import { getHostedAgentCreateUrl } from '@proofable/sdk';

const url = getHostedAgentCreateUrl({
  agentId: 'data-analyst',
  agentWallet,
  controllerWallet,
  identityQHash,
  returnUrl: 'https://yourapp.com/agents/callback'
});
```

When `identityQHash` is present, Hosted Verify requests only `agent-delegation`.

## Gate a React page

```jsx
import { VerifyGate } from '@proofable/sdk/widgets';

export function Page() {
  return (
    <VerifyGate
      gateId="gate_your-app-name"
      onVerified={result => {
        console.log(result.qHash || result.qHashes);
      }}
    >
      <section>Unlocked content</section>
    </VerifyGate>
  );
}
```

## Connect AI clients and agents

The `proofable` CLI connects supported MCP clients to `https://mcp.proofable.me/mcp` and loads agent context into a project:

```bash
npx -y @proofable/sdk setup
npx -y @proofable/sdk mount <agentId> --apply <host>
npx -y @proofable/sdk doctor --live
```

`--apply` accepts `cursor`, `claude`, or `codex`. See [MCP setup](https://docs.proofable.me/mcp/setup) and [Connect agent context](https://docs.proofable.me/agents/runtime-mount).

## Sign in your app

Use this only when your app handles signing itself. This example is EVM. For non-EVM accounts, pass the provider explicitly and include `chain` as a CAIP-2 value.

```js
import { ProofableClient } from '@proofable/sdk';

const client = new ProofableClient({
  apiUrl: 'https://api.proofable.me'
});

const proof = await client.verify({
  verifier: 'ownership-basic',
  data: {
    owner: '0x...',
    contentType: 'application/json',
    content: JSON.stringify({
      title: 'Verified claim',
      type: 'project-update',
      summary: 'Public summary of what is being proven.'
    }),
    reference: {
      type: 'url',
      id: 'https://example.com/source',
      title: 'Source record'
    }
  },
  wallet: window.ethereum // EVM provider
});

console.log(proof.qHash);
console.log(proof.proofUrl);
```

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

## Configuration

```js
const client = new ProofableClient({
  apiUrl: 'https://api.proofable.me',
  timeout: 30000
});
```

`appId` is optional public attribution for advanced server flows. Published gate checkout and `gateCheck({ gateId })` do not require it. `apiKey` (`npk_*`) is optional and server-side only.

## Docs

- [Quickstart](https://docs.proofable.me/quickstart)
- [JavaScript SDK](https://docs.proofable.me/sdks/javascript)
- [CLI](https://docs.proofable.me/sdks/cli)
- [Widgets](https://docs.proofable.me/widgets/overview)
- [HTTP API](https://docs.proofable.me/api/overview)

Proofable implements [CAIP-380 Portable Proof](https://docs.proofable.me/learn/standards/caip-380), so a proof can be checked outside Proofable.

## Support

- Issues: [github.com/proofable/sdk/issues](https://github.com/proofable/sdk/issues)
- Security: [SECURITY.md](./SECURITY.md)

Apache-2.0. Proofable is published by NEUS Network, Inc.
