# @mutationhq/cli

The command line of [Mutation](https://mutation.sh): a person or an agent verifies a mutation (a commit, a change request, the worktree's edits) and queries the System State of a repository with standard SQL (SQL/PGQ) or openCypher.

**In development:** most commands answer Not Implemented (exit 5) in 0.1.0. What is built and what is planned: [mutationhq/cli](https://github.com/mutationhq/cli#status).

By installing or using `mutation` you accept the [Mutation CLI License](https://github.com/mutationhq/cli/blob/main/LICENSE-BINARY). The npm package named `mutation` without a scope is not Mutation's: install `@mutationhq/cli`.

```sh
npm install --global @mutationhq/cli
mutation --help
```

Or without installing: `npx @mutationhq/cli --help`.

Supported: macOS ARM64, Linux x64 and ARM64 (glibc 2.28 or newer), Windows x64. npm installs the one binary for your platform from an optional dependency; no install script runs.

This package holds only the launcher, under the MIT License ([`LICENSE`](LICENSE)). The `mutation` binary it runs comes in a platform package and is free of charge for any use under the [Mutation CLI License](https://github.com/mutationhq/cli/blob/main/LICENSE-BINARY), published only by Mutation; byte-identical copies from registry mirrors, proxies and caches are covered. What each version sends over a network: [privacy notice](https://github.com/mutationhq/cli/blob/main/docs/privacy.md). Report issues at [mutationhq/cli](https://github.com/mutationhq/cli/issues).

Mutation and the Mutation logo are trademarks of Mutation; neither licence grants any right to use them, except to refer accurately to Mutation and its CLI.
