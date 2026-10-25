# Verified handle (React)

Claim a handle, show a `ProofBadge`, and gate a creator action.

## Run

```bash
cd examples/verified-handle-react
npm install
npm run dev
```

## What it shows

1. **Claim:** the user signs a handle binding with `ownership-pseudonym` in the `acme` namespace.
2. **Badge:** `<ProofBadge qHash={qHash} showChains />` on a profile.
3. **Server gate check:** before a privileged action, the backend calls `client.gateCheck({ gateId, address })`.

## Key files

- `src/App.jsx`: claim and badge UI
- `server/check.mjs`: server-side eligibility check

## Docs

- [Account ownership](https://docs.proofable.me/verification/accounts)
- [SDK README](../../README.md)
