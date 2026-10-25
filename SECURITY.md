# Proofable SDK security notes

Report a vulnerability to [dev@proofable.me](mailto:dev@proofable.me) instead of opening a public issue.

Treat **wallet signatures** and **API keys** as secrets. Keep them out of logs, client code, and analytics.

## Authentication model

- **Verification requests** carry a wallet signature over the six-line **CAIP-380 Portable Proof** signing string. Build that string with the SDK, or with the hosted preparation step for HTTP integrations, never by hand.
- **Proof lookups by `qHash`** return public proofs in full. A private proof returns a minimal payload unless the caller proves ownership with an authenticated session or a signed request.
- **Owner reads** of a private proof payload need an owner-signed request. The SDK attaches the signed headers for you.
- **Proof signatures** are bound to the request they sign and do not work as bearer tokens. Do not log or persist them.
- **API keys** (`npk_...`) stay server-side. Never embed them in browser apps.

## Privacy defaults

`client.verify()` and `VerifyGate` create mode both default to **private**. Choose public visibility only when a proof must be reusable without owner-authenticated access:

| Setting | Result |
| --- | --- |
| `privacyLevel: 'private'` (default) | Minimal payload unless the owner reads it |
| `privacyLevel: 'public'`, `publicDisplay: false` | Unlisted: anyone with the `qHash` can read it |
| `privacyLevel: 'public'`, `publicDisplay: true` | Listed and discoverable |

Treat an unlisted public proof as readable by anyone who has its ID. `storeOriginalContent` is an advanced storage control; most integrations keep the default.
