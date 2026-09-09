# Contributing

**If you are integrating Proofable into a product**, use **[docs.proofable.me](https://docs.proofable.me)** and the live product first. The table below is for people proposing changes here.

| Need | Where |
| --- | --- |
| Product documentation | [docs.proofable.me](https://docs.proofable.me) |
| Possible bugs | [Issues](https://github.com/proofable/sdk/issues) |
| Ideas and questions | [Discussions](https://github.com/proofable/sdk/discussions) |
| Security reports | [dev@proofable.me](mailto:dev@proofable.me) (do not post publicly) |
| Release notes | [CHANGELOG.md](./CHANGELOG.md) |

## What lives here

`@proofable/sdk`: the JavaScript client, the `proofable` CLI, gate helpers, MCP host adapters, and the runnable examples. Verifier schemas live in [proofable/docs](https://github.com/proofable/docs). The hosted API and MCP server are not in this repository.

## What helps

- Bug reports with clear steps to reproduce and no secrets in the thread.
- Client, CLI, or gate changes that match what the live product does today.
- Examples that a builder can run end to end without editing them first.
- Tests when you change behavior that builders rely on.

To propose a new check, open a PR in [proofable/docs](https://github.com/proofable/docs) instead. See [Propose a verifier](https://docs.proofable.me/verification/propose-a-verifier).

**Do not** share keys, tokens, bearer secrets, or private proof content in public issues or change descriptions.

## Do not commit

These paths are local-only or generated elsewhere (see `.gitignore`):

- `.env`, `.npmrc`, secrets, and key material
- `cjs/` and other build output

## Describing your change

Explain **what builders or end users will experience differently** (for example new fields, new errors, or renamed concepts). Keep the README, examples, and the written API reference aligned with the live product.
