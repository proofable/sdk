# Portable proofs demo

Proofable turns trust decisions into reusable **portable proofs** you can hold, look up, and attach to a claim. This demo uses `VerifyGate` for gate checkout in the browser (it opens Hosted Verify when a check is missing). In a real app, persist the returned **proof ID** (`qHash`) and confirm with server-side `gateCheck`.

## Run it locally

```bash
cd examples/portable-proofs-demo
npm install
npm run dev
```

By default this runs Vite with an in-browser mock of the Proofable API, so you can explore the flow without a backend.

- **Mock over HTTP:** `npm run dev:with-mock-server` starts a Node mock server on `8787`.
- **Live API:** set `VITE_PROOFABLE_API_URL` (and optionally `VITE_PROOFABLE_HOSTED_CHECKOUT_URL`) in `.env.local`. The mock is disabled when `VITE_PROOFABLE_API_URL` is set.

The example carries a small standalone Proofable theme in `src/index.css`.

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

Publish listings in [Profile → Listings](https://proofable.me/profile?tab=portals) and pass the real `gateId` into `VerifyGate` and `gateCheck`. The demo uses sample gate ids derived from each claim; replace them before connecting to the live API.

## Store the proof

Store the returned **proof ID** (`qHash`) with your claim record. Before prompting the user again, check whether a valid proof already exists.

A proof ID is a portable proof handle, not a session token. In production, validate it server-side, for example with `gateCheck`.
