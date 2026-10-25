# Portable proofs demo

This demo gates claims with `VerifyGate`, which opens Hosted Verify when a check is missing. In a real app, store the returned proof ID (`qHash`) and confirm access with server-side `gateCheck`.

## Run it locally

```bash
cd examples/portable-proofs-demo
npm install
npm run dev
```

By default this runs Vite with an in-browser mock of the Proofable API, so you can explore the flow without a backend.

- **Mock over HTTP:** `npm run dev:with-mock-server` starts a Node mock server on port `8787`.
- **Live API:** set `VITE_PROOFABLE_API_URL` (and optionally `VITE_PROOFABLE_HOSTED_CHECKOUT_URL`) in `.env.local`. Setting `VITE_PROOFABLE_API_URL` turns the mock off.

## Example

```jsx
import { VerifyGate } from '@proofable/sdk/widgets';

<VerifyGate
  apiUrl={import.meta.env.VITE_PROOFABLE_API_URL}
  hostedCheckoutUrl={import.meta.env.VITE_PROOFABLE_HOSTED_CHECKOUT_URL}
  gateId="gate_fair-airdrop"
  buttonText="Create proof"
>
  <button type="button">Get fair airdrop access</button>
</VerifyGate>
```

## Verifiers used in the demo

| Card | Verifier |
| ---- | --------- |
| Fair airdrop, insider path | `proof-of-human` |
| Creator, domain listing | `ownership-social`, `ownership-dns-txt` |
| Team resource | `ownership-org-oauth` |
| Member / collector / admin | `token-holding`, `nft-ownership`, `contract-ownership` |
| Safe payout (risk) | `wallet-risk` |
| Agents | `agent-identity`, `agent-delegation` |

## Use real gates

The demo derives sample gate ids from each claim. Before connecting to the live API, publish listings in [Profile → Listings](https://proofable.me/profile?tab=portals) and pass the real `gateId` into `VerifyGate` and `gateCheck`.

## Store the proof

Store the returned proof ID (`qHash`) with your claim record, and check for a valid proof before prompting the user again. A proof ID is a handle to a proof and grants no session; validate it on the server, for example with `gateCheck`.
