# Mutation CLI

`mutation` is the command line of [Mutation](https://mutation.sh). With it, a person or an agent verifies a mutation (a commit, a change request, or the edits in a worktree) and queries the System State of a repository with standard SQL (SQL/PGQ) or openCypher. It runs on your machine, on a local clone from any git host.

This repository holds the CLI's documentation, its npm packages, its changelog and, from the first release on, its release files. The source of `mutation` is not public.

> [!IMPORTANT]
> **Mutation's CLI is in development.** Version 0.1.0 is not released yet, and most commands answer Not Implemented (exit code 5). The install commands below work once 0.1.0 is published.

## Status

Every command, flag and query kind already parses in full and checks its arguments. What is built today:

| Command | State |
| --- | --- |
| `mutation config show`, `validate`, `schema`, `init` | Built: the repository's `mutation.yml` and the machine's `config.yml` with `MUT_*` variables |
| `mutation completions <shell>` | Built: bash, zsh, fish, PowerShell, elvish |
| `mutation debug index`, `debug shares`, `debug detect` | Built: measurements, unstable across releases |
| `mutation index`, `query <kind>`, `verify`, `context`, `watch`, `debug data verify` | Not implemented: arguments are checked, then the command exits 5 |

The [command reference](docs/commands.md) gives each command's status.

## Install

By installing or using `mutation` you accept the [Mutation CLI License](LICENSE-BINARY) ([summary](#license)). The npm package named `mutation` without a scope is not Mutation's: always install `@mutationhq/cli`.

Once 0.1.0 is published, any of these will install it:

```sh
# npm: installs the `mutation` command
npm install --global @mutationhq/cli

# npx: runs it without installing
npx @mutationhq/cli --help

# Homebrew (macOS and Linux)
brew install mutationhq/tap/mutation
```

Archives for each platform will also be attached to each [GitHub Release](https://github.com/mutationhq/cli/releases), with a signed `SHA256SUMS` ([verifying releases](docs/verifying-releases.md)).

| Platform | npm package |
| --- | --- |
| macOS, ARM64 (Apple silicon) | `@mutationhq/cli-darwin-arm64` |
| Linux, x64, glibc 2.28 or newer | `@mutationhq/cli-linux-x64` |
| Linux, ARM64, glibc 2.28 or newer | `@mutationhq/cli-linux-arm64` |
| Windows, x64 | `@mutationhq/cli-win32-x64` |

Intel Macs, musl-based Linux (Alpine) and Windows on ARM are not supported. See [installation](docs/installation.md) for the details, including the CPU features each build requires.

## Quick start

What works in 0.1.0:

```sh
mutation --version --format json   # the version and the build's details
mutation config init               # write mutation.yml with every default
mutation config validate           # check the repository's mutation.yml
mutation config show               # the settings a run would apply, each with its origin
mutation completions zsh > "${fpath[1]}/_mutation"
```

What the CLI is designed to do, not built yet (each exits 5 today):

```sh
mutation verify main..HEAD                       # verify the change from main to HEAD
mutation query callers app::run                  # what calls a definition, at HEAD
mutation query sql 'SELECT key FROM code.nodes LIMIT 5'
mutation context app::run --budget 4000          # code around a target, for an agent
```

## Commands

| Command | What it does | Status |
| --- | --- | --- |
| `index [PATH]` | Index a revision or a history into the repository's data file | Not implemented |
| `query <kind>` | Answer a question from the index: `sql`, `cypher`, `find`, `definition`, `outline`, `references`, `callers`, `callees`, `impact`, `path`, `diff`, `text`, `metrics`, `catalog` | Not implemented |
| `verify [REV\|A..B]` | Run the workflow's probes on a change and its base, compare their findings, decide pass, fail or incomplete | Not implemented |
| `context [TARGET...]` | Give the code around targets within a budget of tokens, for an agent | Not implemented |
| `watch` | Verify the worktree each time it changes, one JSON line an event | Not implemented |
| `config show\|validate\|schema\|init` | Show, check, describe or write the settings | Built |
| `completions SHELL` | Write a shell's completions to stdout | Built |
| `debug ...` | Measurements, unstable across releases | Partly built |

Global options: `-C DIR`, `--format`, `--output FMT=FILE`, `--threads N`, `--no-update`, `--config FILE`, `--color auto|always|never`, `--quiet`. Details in [commands](docs/commands.md).

## Configuration

| Source | What it sets |
| --- | --- |
| `mutation.yml` in the repository | The repository's settings: invariants, ignored paths, how a review speaks on the host. The first present of `.github/`, `.gitlab/`, then the root |
| The user's `config.yml` | The machine's settings: `threads`, `format`, `color`, `data`, `spill` |
| `MUT_*` variables | The same machine settings: `MUT_THREADS`, `MUT_FORMAT`, `MUT_COLOR`, `MUT_DATA`, `MUT_SPILL`, and `MUT_CONFIG` for a file |

The user's `config.yml` lives at:

| System | Path |
| --- | --- |
| Linux | `$XDG_CONFIG_HOME/mutation/config.yml` (`~/.config/mutation/config.yml` without it) |
| macOS | `~/Library/Application Support/mutation/config.yml` |
| Windows | `%APPDATA%\mutation\config.yml` |

Precedence, lowest first: defaults, the user's file, `--config FILE` or `MUT_CONFIG`, `MUT_*` variables, flags. An unknown key or variable is refused with exit 2. See [configuration](docs/configuration.md).

## Exit codes

| Code | Meaning |
| --- | --- |
| 0 | Done; `verify` decided pass |
| 1 | Failed: I/O, an output not written, a corrupt or incompatible data file |
| 2 | Usage: arguments, configuration, or a revision, key or patch that does not resolve |
| 3 | `verify` decided fail: blocking findings |
| 4 | Incomplete answer or decision |
| 5 | Not implemented |
| 130 | Interrupted |

See [exit codes](docs/exit-codes.md) for the error codes and which exit wins when several apply.

## Documentation

- [Installation](docs/installation.md)
- [Commands](docs/commands.md)
- [Configuration](docs/configuration.md)
- [Exit codes](docs/exit-codes.md)
- [Verifying releases](docs/verifying-releases.md)
- [Privacy notice](docs/privacy.md)
- [Legal documents](docs/legal.md)
- [How the npm packages fit together](npm/README.md)
- [Changelog](CHANGELOG.md)

## Reporting issues and security

Bugs and feature requests go to [issues](https://github.com/mutationhq/cli/issues); [CONTRIBUTING.md](CONTRIBUTING.md) says what a good report includes. Report a vulnerability privately to support@mutation.sh, never in a public issue ([SECURITY.md](SECURITY.md)).

## License

- **The `mutation` program** (the Software) is free of charge for any lawful use, personal or commercial, under the [Mutation CLI License](LICENSE-BINARY), which you accept by installing or using it. Only Mutation publishes it, through the Official Channels: the npm packages under `@mutationhq`, the `mutationhq/homebrew-tap` formula and this repository's GitHub Releases. A byte-identical copy from a registry mirror, a proxy, a CDN or your organization's cache is covered too; redistributing or repackaging it is not allowed. It is provided free of charge and, to the extent the law allows, without warranty (see the licence for the rights that the law keeps for you). Check each download's checksum and signature before you use it ([verifying releases](docs/verifying-releases.md)). Third-party components inside it keep their own licences, listed in `THIRD-PARTY-NOTICES` with each release.
- **This repository's files**, except `LICENSE-BINARY` (the docs, the npm launcher and manifests, the READMEs, the templates), are under the [MIT License](LICENSE). So is the `@mutationhq/cli` npm package, which holds only the launcher; the binary comes in the platform packages, under the Mutation CLI License.
- **Contributions:** pull requests are MIT with a DCO sign-off, and issues are Feedback under the licence ([contributing](CONTRIBUTING.md)).

[Legal documents](docs/legal.md) lists each of them, its version and whom it binds.

## Privacy

What each version of `mutation` sends over a network, and the Telemetry Mutation plans to add with its controls, are in the [privacy notice](docs/privacy.md).

## Export

The `mutation` binaries compute SHA-1 and SHA-256 hashes and contain no encryption for data confidentiality. You are responsible for complying with the export control and sanctions laws that apply to you; see section 14 of the [Mutation CLI License](LICENSE-BINARY).

## Trademarks

Mutation and the Mutation logo are trademarks of Mutation. Neither the MIT License nor the Mutation CLI License grants any right to use them, except to refer accurately to Mutation and its CLI. Do not publish a package, formula, image, binary or download under the Mutation name or a confusingly similar one. npm, Homebrew, GitHub, Apple, macOS, Windows and the other names here belong to their owners; their use does not imply endorsement.
