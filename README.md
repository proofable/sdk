# Proofable SDK

Add verification, reusable proof, and agent permissions to JavaScript apps.

Proofable implements [CAIP-380 (Portable Proof)](https://github.com/ChainAgnostic/CAIPs/pull/380), a portable evidence format for carrying verifiable results across environments.

## Install (library)

```bash
npm install @proofable/sdk
```

## Connect a supported MCP client

Proofable MCP is the hosted connection for supported chats, IDEs, and job runtimes. They can read the same profile, current proofs, listings, and permissions.

Register the hosted remote, then click **Connect**:

`https://mcp.proofable.me/mcp`

Ask: **"Show my Proofable profile and current proofs."**

Optional terminal installer (writes that URL and the public workflow skill):

```bash
npx -y @proofable/sdk setup
```

Full steps: [MCP setup](https://docs.proofable.me/mcp/setup).

## Connect an agent to a project

```bash
npx -y @proofable/sdk setup
npx -y @proofable/sdk mount <agentId> --apply <host>
```

Loads the agent's verified identity, scoped authority, and host rules into the project. See [Connect Agent Context](https://docs.proofable.me/agents/runtime-mount).

## Common tasks

- Hosted verification flows that return reusable portable proofs
- Server checks before access, rewards, payments, or actions
- React gates with `VerifyGate`
- Agent identity, controller-approved authority, and per-payment limits
- Marketplace listings, qualification, checkout, fulfillment, and access confirmation

## Hosted Verify

Use Hosted Verify when Proofable should handle the signing step outside your app UI. Prefer a **published gate**:

```js
import { getHostedCheckoutUrl } from '@proofable/sdk';

const url = getHostedCheckoutUrl({
  gateId: 'gate_your-app-name',
  returnUrl: 'https://yourapp.com/auth/callback'
});

window.location.assign(url);
```

After completion, Proofable redirects back with a proof ID in the `qHash` field. Store the proof ID with your user or record.

Dedicated agent setup keeps the agent-signed identity step separate from the approving account:

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

## In-app signing

Use this only when your app intentionally handles signing. This example is EVM. For non-EVM accounts, pass the provider explicitly and include `chain` as a CAIP-2 value.

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

## React widget

Use `VerifyGate` with your published `gateId`:

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

## Check proofs

Use `gateCheck` from trusted server code when you need allow/deny before access:

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

`appId` is optional public attribution for advanced server/app flows. Published gate checkout and `gateCheck({ gateId })` do not require it.

`apiKey` / `npk_*` is optional and server-side only.

## Docs

- Start: https://docs.proofable.me
- Sell access: https://docs.proofable.me/quickstart
- JavaScript SDK: https://docs.proofable.me/sdks/javascript
- Ownership Basic: https://docs.proofable.me/verification/ownership-basic
- Widgets: https://docs.proofable.me/widgets/overview
- MCP: https://docs.proofable.me/mcp/overview
- API: https://docs.proofable.me/api/overview
