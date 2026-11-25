# @mutationhq/cli

The command line of [Mutation](https://mutation.sh): a person or an agent verifies a mutation (a commit, a change request, the worktree's edits) and queries the System State of a repository with standard SQL (SQL/PGQ) or openCypher.

By installing or using `mutation` you accept the [Mutation CLI License](https://github.com/mutationhq/cli/blob/main/LICENSE-BINARY). The npm package named `mutation` without a scope is not Mutation's: install `@mutationhq/cli`.

```sh
npm install --global @mutationhq/cli
mutation --help
```

Or without installing: `npx @mutationhq/cli --help`.

Supported: macOS ARM64, Linux x64 and ARM64 (glibc 2.28 or newer), Windows x64. npm installs the one binary for your platform from an optional dependency; no install script runs.

This package holds only the launcher, under the MIT License ([`LICENSE`](LICENSE)). The `mutation` binary it runs comes in a platform package and is under the [Mutation CLI License](https://github.com/mutationhq/cli/blob/main/LICENSE-BINARY), published only by Mutation; byte-identical copies from registry mirrors, proxies and caches are covered. `mutation` is free for personal and commercial use in a person's workstation development session, including agents and git hooks within that session. Pipeline Use is free for Public Repositories and Personal Non-Commercial Projects. Other Pipeline Use requires a paid Runner License from [mutation.sh/pricing](https://mutation.sh/pricing) after one 15-day evaluation per organization or independent individual. Hosted and self-hosted workflows are treated alike. Licensing is a legal requirement; the Software performs no license check. See sections 1.14–1.17 and 3.4 of the [licence](https://github.com/mutationhq/cli/blob/main/LICENSE-BINARY) for the definitions and evaluation rules. What each version sends over a network: [privacy notice](https://github.com/mutationhq/cli/blob/main/docs/privacy.md). Report issues at [mutationhq/cli](https://github.com/mutationhq/cli/issues).

Mutation and the Mutation logo are trademarks of Mutation; neither licence grants any right to use them, except to refer accurately to Mutation and its CLI.
