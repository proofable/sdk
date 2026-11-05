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

## Talk to your agent from anywhere

Your agent runs on Proofable, so any app, server or runtime can talk to it with one call. Nothing to deploy. It answers as itself, inside the limits you signed, and cites the records it read.

```js
import { ProofableClient } from '@proofable/sdk';

const client = new ProofableClient({ apiKey: process.env.PROOFABLE_ACCESS_KEY });

const turn = await client.agentChat({
  agentId: 'my-agent',
  messages: [{ role: 'user', content: 'Summarize this week for the client.' }],
  onEvent: (type, data) => type === 'answer.delta' && process.stdout.write(data.text),
});

turn.answer;     // the agent's answer
turn.citations;  // the records it read: { qHash, title, facet, visibility }
turn.credits;    // what the turn spent
```

An action the agent's permission does not allow is refused before it runs, in every runtime that calls it. Revoke the permission once and the next call stops. Read your spend any time with `client.getUsage({ from: '2026-11-01' })`.

## Let your app's users talk to your agent

Sign your users in with Proofable, then make the same call as them. Each person talks to your public agent inside their own Proofable profile, with their records and nothing of yours in the conversation. Your agent's instructions and the records you made public are what it knows.

```js
import { ProofableClient, ProofableSignIn } from '@proofable/sdk';

// clientId: what register() returned the first time, kept with your app's settings.
const signIn = new ProofableSignIn({ redirectUri: 'https://your.app/proofable/callback', clientId: settings.proofableClientId });

// 1. Send the person to Proofable. Keep `state` and `verifier` for when they come back (a signed cookie works).
const started = await signIn.start();
redirect(started.url);

// 2. They are back at your callback with `code` and `state` in the URL.
const tokens = await signIn.finish({ code: query.code, verifier: kept.verifier, state: query.state, expectedState: kept.state });

// 3. Act as the person. Your app pays: appId and billingWallet make every turn your organization's spend.
const person = new ProofableClient({
  apiKey: tokens.accessToken,
  appId: 'your-app',
  billingWallet: '0xYourAccount',
  appOrigin: 'https://your.app',
});
const who = await person.me();                            // { handle, address, ... }
const turn = await person.agentChat({
  agentId: 'my-agent',
  agentWallet: '0xYourAccount',                           // your account: the agent runs in the person's own profile
  turnId: `u-${yourUserKey}-${Date.now()}`,               // your key for the person; every spend record carries it
  messages: [{ role: 'user', content: 'Where does the case start?' }],
  onEvent: (type, data) => type === 'answer.delta' && respond(data.text),
});
```

**Sign-in.** `start()` with no `clientId` registers your callback with Proofable and returns the id; store it with your app's settings and pass it on every later instance. Refresh with `signIn.refresh(tokens.refreshToken)` before the token expires.

**Who pays.** Your app does. Turn it on once, signed in as yourself:

```bash
npx -y @proofable/sdk sponsor --app your-app --origin https://your.app --credits-per-day 2000
```

From then on a client built with `appId` and `billingWallet` carries your sponsorship. Your organization pays for your users' checks and their chats with your agents, within the daily cap you set, and every spend record names your app and your `turnId`, so you can set your own limits per person. Without `appId` and `billingWallet`, each person spends their own credits. A record the agent keeps for a person is the person's own and costs one credit from their own allowance, which every account has. In code, the same step is `client.sponsorApp({ appId, origin, creditsPerDay })`.

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
| `client.agentChat()` | Talk to a hosted agent: one turn, run as the agent, with citations |
| `client.getUsage()` | Your credits and spend, by line and by day |
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
