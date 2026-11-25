# Mutation CLI

`mutation` verifies every change to your code, a person's or an agent's, and answers questions about your repository from its code graph. It runs on your machine, on a local clone from any git host, and works for you, your CI and your coding agents alike.

- **Verify a change**: `mutation verify` runs the probes on a change and its base, compares their findings and decides pass or fail, with SARIF, Code Quality, Markdown and HTML reports.
- **Query the code**: callers, callees, references, impact, paths between definitions, metrics, or any question in standard SQL (SQL/PGQ) or openCypher.
- **Give agents context**: `mutation context` hands an agent the code around a target within a budget of tokens.

## Quick start

By installing or using `mutation` you accept the [Mutation CLI License](LICENSE-BINARY) ([summary](#license)). The npm package named `mutation` without a scope is not Mutation's: always install `@mutationhq/cli`.

Install it with npm or Homebrew:

```sh
npm install --global @mutationhq/cli     # or run it once: npx @mutationhq/cli --help
brew install mutationhq/tap/mutation     # macOS and Linux
```

Then try it in any git repository:

```sh
cd your-repository

mutation verify                                  # your uncommitted changes against HEAD
mutation verify main..HEAD                       # the change from main to HEAD
mutation query find run --fuzzy                  # definitions by name
mutation query callers app::run                  # what calls a definition
mutation query impact app::run                   # what depends on it
mutation query sql 'SELECT key FROM code.nodes LIMIT 5'
mutation context app::run --budget 4000          # the code around it, for an agent
```

The first command indexes the repository into `.mutation/data.mt`, shared by every worktree of the repository; later commands read only what changed since. `mutation query catalog` lists what the index holds, and `--print-sql` shows the SQL behind any query.

## Use it with coding agents

The [`mutation` skill](skills/mutation/SKILL.md) teaches a coding agent the loop: understand the code with `query` and `context` before an edit, and run `mutation verify` before it says a task is done. It follows the open [Agent Skills](https://agentskills.io) format, so one skill serves every agent:

| Agent | Install |
| --- | --- |
| Claude Code | `/plugin install mutation --marketplace mutationhq/cli` |
| Codex CLI | `codex plugin marketplace add mutationhq/cli`, then `codex plugin add mutation@mutation` |
| Kiro CLI | `npx skills add mutationhq/cli -a kiro-cli` (add `-g` for every workspace) |
| Any other agent | `npx skills add mutationhq/cli` |

In Kiro IDE, add it as a power: **Powers**, then **Add Custom Power**, then import `https://github.com/mutationhq/cli`. An agent without skills can still use `mutation` as it is: `mutation --help` and every command's `--help` describe its arguments, and `--format json` gives output to parse.

## Use it in CI/CD

`mutation verify` exits 3 when a change adds blocking findings, so a pipeline fails on it without parsing output. Its reports feed your host's code scanning:

```yaml
# .github/workflows/mutation.yml
name: Mutation
on: pull_request
permissions:
  contents: read
  security-events: write
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - run: npx --yes @mutationhq/cli verify origin/${{ github.base_ref }}...HEAD --settings origin/${{ github.base_ref }} --output sarif=mutation.sarif
      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: mutation.sarif
```

On GitLab, `--format codeclimate` gives the Code Quality report. `--settings` reads `mutation.yml` from the target branch, so a change cannot rewrite the settings it is verified against.

> [!NOTE]
> **CI/CD for a private repository requires a Runner License after the evaluation, unless the repository is part of a Personal Non-Commercial Project.** `mutation` is free for personal and commercial use in a person's workstation development session, including agents and git hooks within that session. Pipeline Use is free for Public Repositories and Personal Non-Commercial Projects. Other Pipeline Use requires a paid Runner License from [mutation.sh/pricing](https://mutation.sh/pricing) after one 15-day evaluation per organization or independent individual. Hosted and self-hosted workflows are treated alike. Licensing is a legal requirement; the Software performs no license check. See sections 1.14–1.17 and 3.4 of the [licence](LICENSE-BINARY) for the definitions and evaluation rules.

## Platforms

| Platform | npm package |
| --- | --- |
| macOS, ARM64 (Apple silicon) | `@mutationhq/cli-darwin-arm64` |
| Linux, x64, glibc 2.28 or newer | `@mutationhq/cli-linux-x64` |
| Linux, ARM64, glibc 2.28 or newer | `@mutationhq/cli-linux-arm64` |
| Windows, x64 | `@mutationhq/cli-win32-x64` |

Archives for each platform are attached to each [GitHub Release](https://github.com/mutationhq/cli/releases), with a signed `SHA256SUMS` ([verifying releases](docs/verifying-releases.md)). Intel Macs, musl-based Linux (Alpine) and Windows on ARM are not supported. See [installation](docs/installation.md), including the CPU features each build requires.

## Commands

| Command | What it does |
| --- | --- |
| `verify [REV\|A..B]` | Run the workflow's probes on a change and its base, compare their findings, decide pass, fail or incomplete |
| `query <kind>` | Answer a question from the index: `sql`, `cypher`, `find`, `definition`, `outline`, `references`, `callers`, `callees`, `impact`, `path`, `diff`, `text`, `metrics`, `catalog` |
| `context [TARGET...]` | Give the code around targets within a budget of tokens, for an agent |
| `watch` | Verify the worktree each time it changes, one JSON line an event |
| `index [PATH]` | Index a revision or a history ahead of the commands that read it |
| `config show\|validate\|schema\|init` | Show, check, describe or write the settings |
| `completions SHELL` | Write a shell's completions: bash, zsh, fish, PowerShell, elvish |

Every command reads a revision (`REV`), a comparison (`A..B`, or `A...B` from the merge base), the worktree, a patch (`--patch FILE|- --at REV`) or a folder without git. Global options: `-C DIR`, `--format`, `--output FMT=FILE`, `--threads N`, `--no-update`, `--config FILE`, `--color auto|always|never`, `--quiet`. Details in [commands](docs/commands.md).

## Configuration

| Source | What it sets |
| --- | --- |
| `mutation.yml` in the repository | The repository's settings: invariants, ignored paths, how a review speaks on the host. The first present of `.github/`, `.gitlab/`, then the root. `mutation config init` writes one with every default |
| The user's `config.yml` | The machine's settings: `threads`, `format`, `color`, `data`, `spill` |
| `MUT_*` variables | The same machine settings: `MUT_THREADS`, `MUT_FORMAT`, `MUT_COLOR`, `MUT_DATA`, `MUT_SPILL`, and `MUT_CONFIG` for a file |

The user's `config.yml` lives at `$XDG_CONFIG_HOME/mutation/config.yml` on Linux (`~/.config/mutation/config.yml` without it), `~/Library/Application Support/mutation/config.yml` on macOS and `%APPDATA%\mutation\config.yml` on Windows. Precedence, lowest first: defaults, the user's file, `--config FILE` or `MUT_CONFIG`, `MUT_*` variables, flags. An unknown key or variable is refused with exit 2. See [configuration](docs/configuration.md).

## Exit codes

| Code | Meaning |
| --- | --- |
| 0 | Done; `verify` decided pass |
| 1 | Failed: I/O, an output not written, a corrupt or incompatible data file |
| 2 | Usage: arguments, configuration, or a revision, key or patch that does not resolve |
| 3 | `verify` decided fail: blocking findings |
| 4 | Incomplete answer or decision |
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
- [Model withdrawal form](docs/withdrawal-form.md)
- [How the npm packages fit together](npm/README.md)
- [Changelog](CHANGELOG.md)

This repository holds the CLI's documentation, its npm packages, its agent skills and its release files. The source of `mutation` is not public.

## Reporting issues and security

Bugs and feature requests go to [issues](https://github.com/mutationhq/cli/issues); [CONTRIBUTING.md](CONTRIBUTING.md) says what a good report includes. Report a vulnerability privately to support@mutation.sh, never in a public issue ([SECURITY.md](SECURITY.md)).

## License

- **The `mutation` program** (the Software) is under the [Mutation CLI License](LICENSE-BINARY), which you accept by installing or using it. `mutation` is free for personal and commercial use in a person's workstation development session, including agents and git hooks within that session. Pipeline Use is free for Public Repositories and Personal Non-Commercial Projects. Other Pipeline Use requires a paid Runner License from [mutation.sh/pricing](https://mutation.sh/pricing) after one 15-day evaluation per organization or independent individual. Hosted and self-hosted workflows are treated alike. Licensing is a legal requirement; the Software performs no license check. See sections 1.14–1.17 and 3.4 of the [licence](LICENSE-BINARY) for the definitions and evaluation rules. A Runner License renews monthly or annually until you cancel it online, and consumers in the EU, the EEA and the UK may withdraw within 14 days ([model withdrawal form](docs/withdrawal-form.md)). Only Mutation publishes it, through the Official Channels: the npm packages under `@mutationhq`, the `mutationhq/homebrew-tap` formula and this repository's GitHub Releases. A byte-identical copy from a registry mirror, a proxy, a CDN or your organization's cache is covered too; redistributing or repackaging it is not allowed. To the extent the law allows, it comes without warranty (see the licence for the rights that the law keeps for you). Check each download's checksum and signature before you use it ([verifying releases](docs/verifying-releases.md)). Third-party components inside it keep their own licences, listed in `THIRD-PARTY-NOTICES` with each release.
- **This repository's Open Files**, including the docs, the agent skills, the npm launcher and manifests, the READMEs and the templates, are under the [MIT License](LICENSE). The Software, `LICENSE-BINARY` and `THIRD-PARTY-NOTICES` are outside that grant, and `CODE_OF_CONDUCT.md` is under CC BY 4.0. The `@mutationhq/cli` npm package holds the MIT-licensed launcher; the binary comes in the platform packages, under the Mutation CLI License.
- **Contributions:** pull requests are MIT with a DCO sign-off, and issues are Feedback under the licence ([contributing](CONTRIBUTING.md)).

[Legal documents](docs/legal.md) lists each of them, its version and whom it binds.

## Privacy

What `mutation` sends over a network, including its Telemetry and the controls a Runner License gives, is in the [privacy notice](docs/privacy.md).

## Export

The `mutation` binaries compute SHA-1 and SHA-256 hashes and contain no encryption for data confidentiality. You are responsible for complying with the export control and sanctions laws that apply to you; see section 14 of the [Mutation CLI License](LICENSE-BINARY).

## Trademarks

Mutation and the Mutation logo are trademarks of Mutation. Neither the MIT License nor the Mutation CLI License grants any right to use them, except to refer accurately to Mutation and its CLI. Do not publish a package, formula, image, binary or download under the Mutation name or a confusingly similar one. npm, Homebrew, GitHub, Apple, macOS, Windows and the other names here belong to their owners; their use does not imply endorsement.
