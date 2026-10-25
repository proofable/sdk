# Contributing

By participating you agree to the [Code of Conduct](./CODE_OF_CONDUCT.md). To integrate Proofable into a product, start at [docs.proofable.me](https://docs.proofable.me).

| Need | Where |
| --- | --- |
| Product documentation | [docs.proofable.me](https://docs.proofable.me) |
| Possible bugs | [Issues](https://github.com/proofable/sdk/issues) |
| Ideas and questions | [Discussions](https://github.com/proofable/sdk/discussions) |
| Security reports | [dev@proofable.me](mailto:dev@proofable.me) (do not post publicly) |
| Release notes | [CHANGELOG.md](./CHANGELOG.md) |

## What lives here

`@proofable/sdk`: the JavaScript client, the `proofable` CLI, gate helpers, MCP host adapters, widgets, and runnable examples. Verifier schemas live in [proofable/docs](https://github.com/proofable/docs); propose a new check there with [Propose a verifier](https://docs.proofable.me/verification/propose-a-verifier).

## What helps

- Bug reports with steps to reproduce.
- Client, CLI, or gate changes that match what the live product does today.
- Examples a builder can run end to end without editing them first.
- Tests for any change to behavior builders rely on.

Keep keys, tokens, `.env` and `.npmrc` files, and private proof content out of issues, pull requests, and commits.
## Changelog

Add a note under `## [Unreleased]` in [CHANGELOG.md](./CHANGELOG.md), grouped as Added, Changed, Deprecated, Removed, Fixed, or Security. Describe what builders or end users will notice, such as new fields, new errors, or renamed concepts. Leave out ticket IDs and process notes. Keep the README and examples matching the live product.
