# Node.js example

Use this example when your backend already holds a wallet key or signer and creates portable proofs server-side.

For product flows where the user signs, use [Hosted Verify](https://docs.proofable.me/verification/hosted) or browser `client.verify()`.

## Run it

```bash
cd examples/nodejs-basic
npm install
export TEST_WALLET_PRIVATE_KEY=0x...   # test wallet only
node index.js
```

The script prepares the signing message, signs it, submits the proof, waits for completion, then runs a gate check. The result is a `qHash` you can store like any other id.

## Core pattern

```javascript
const standardizeRes = await fetch('https://api.proofable.me/api/v1/verification/standardize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ walletAddress, verifierIds: ['ownership-basic'], data, signedTimestamp })
});

const standardized = await standardizeRes.json();
const message = standardized.data.signerString;
const signature = await wallet.signMessage(message);
```

- [SDK](../../README.md)
- [API](https://docs.proofable.me/api/overview)
