# Proofable Widgets

React components that show verified state and gate content with the same portable proofs your server checks.

## Install

```bash
npm install @proofable/sdk react react-dom
```

## VerifyGate

`VerifyGate` opens Hosted Verify when a user needs a proof. The published gate owns verifier inputs, pricing, and checkout policy.

```jsx
import { VerifyGate } from '@proofable/sdk/widgets';

export function Page() {
  return (
    <VerifyGate gateId="gate_your-app-name">
      <div>Unlocked content</div>
    </VerifyGate>
  );
}
```

## ProofBadge

```jsx
import { ProofBadge } from '@proofable/sdk/widgets';

<ProofBadge qHash={proof.qHash} showChains />
```

## Docs

- [Widgets overview](https://docs.proofable.me/widgets/overview)
- [VerifyGate](https://docs.proofable.me/widgets/verifygate)
- [Sell access](https://docs.proofable.me/quickstart)
