---
name: proofable-integrate
description: Add Proofable access control to a host app. Install the SDK, drop in the gate widget, wire the server check, and test the flow. Use when a developer wants to gate content, sell access, or add proof-based checks to their application.
license: Apache-2.0
compatibility: Requires @proofable/sdk (npm) and a Proofable gate ID from proofable.me.
metadata:
  author: Proofable
  version: "0.1.0"
  homepage: https://docs.proofable.me/quickstart
---

# Integrate Proofable

Add proof-based access control to an app in four steps. The developer needs a `gateId` from proofable.me and their framework name. Everything else is handled here.

## Ask once

Before writing code, ask the developer:

1. **What framework?** (Next.js, Vite/React, Express, other)
2. **Do you have a gate ID?** If not, point them to proofable.me → profile → Listings → Publish, then copy the `gateId`.

Do not ask about Proofable architecture, verifier types, proof schemas, wallet setup, or credential choices. The gate handles all of that.

## Install

```bash
npm install @proofable/sdk
```

If the app uses React, also ensure `react` and `react-dom` are installed (peer deps).

## Browser: gate the content

### React (Next.js, Vite, CRA)

```jsx
import { VerifyGate, ProofBadge } from '@proofable/sdk/widgets';

function ProtectedPage() {
  return (
    <VerifyGate gateId="gate_your-app-name">
      <ProtectedContent />
    </VerifyGate>
  );
}
```

`VerifyGate` checks for an existing proof, opens hosted sign-in on proofable.me when a new one is needed, then renders the children. Wallet, passkey, and OAuth all happen on Proofable, not inside the app.

Optional: show proof status anywhere with `<ProofBadge qHash={proof.qHash} />`.

### Non-React (redirect flow)

```js
import { getHostedCheckoutUrl } from '@proofable/sdk';

window.location.assign(
  getHostedCheckoutUrl({
    gateId: 'gate_your-app-name',
    returnUrl: 'https://app.example.com/auth/callback',
  }),
);
```

Read the proof ID (`qHash`) from the callback URL query string, then store it.

## Server: confirm access

Before granting access or paying out, confirm the visitor still satisfies the gate. Every Proofable account has an address, including passkey and OAuth accounts.

```js
import { ProofableClient } from '@proofable/sdk';

const client = new ProofableClient();
const result = await client.gateCheck({
  gateId: 'gate_your-app-name',
  address: user.accountAddress,
});

if (!result.data?.gate?.allRequiredSatisfied) {
  // send the user back to VerifyGate or Proofable sign-in
}
```

For server-only apps or CI, use a profile access key: `new ProofableClient({ apiKey: 'npk_...' })`. Create keys at proofable.me → profile → Account → Access keys. Never paste keys into chat or committed files.

## Test

1. Run the app and navigate to the gated page.
2. Confirm `VerifyGate` opens the Proofable sign-in flow.
3. Complete sign-in (wallet, passkey, or OAuth all work).
4. Confirm the gated content renders.
5. Call `gateCheck` from the server with the returned address. Confirm `allRequiredSatisfied` is `true`.

## Copy rules

User-visible strings in the app should use plain language:

- "gate" or "access", not "verifier" or "trust check"
- "proof", not "qHash" or "portable proof" in UI text
- "Sign in" or "Connect", not "mount" or "authenticate"
- "Your account", not "wallet" or "DID" unless the user specifically chose a wallet flow

Full copy guide: [references/quickstart.md](references/quickstart.md)

## When to stop

The integration is complete when:

1. `VerifyGate` renders on the gated page.
2. A visitor can sign in and see protected content.
3. The server `gateCheck` call returns `allRequiredSatisfied: true` for a verified visitor.
4. No Proofable jargon appears in user-visible strings.

Do not add extra Proofable concepts, tools, or surfaces unless the developer asks.

Docs: [Start](https://docs.proofable.me), [Hosted sign-in](https://docs.proofable.me/cookbook/auth-hosted-verify), [Sell access](https://docs.proofable.me/quickstart)
