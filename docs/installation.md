# Installation

By installing or using `mutation` you accept the [Mutation CLI License](../LICENSE-BINARY): `mutation` is free for personal and commercial use in a person's workstation development session, including agents and git hooks within that session. Pipeline Use is free for Public Repositories and Personal Non-Commercial Projects. Other Pipeline Use requires a paid Runner License from [mutation.sh/pricing](https://mutation.sh/pricing) after one 15-day evaluation per organization or independent individual. Hosted and self-hosted workflows are treated alike. Licensing is a legal requirement; the Software performs no license check. See sections 1.14–1.17 and 3.4 of the [licence](../LICENSE-BINARY) for the definitions and evaluation rules. The licence states the rest of its rights and limits. The [privacy notice](privacy.md) says what each version sends over a network.

> [!WARNING]
> The npm package named `mutation`, without a scope, is someone else's package, not Mutation's. Install `@mutationhq/cli`.

## Supported platforms

| System | Architecture | Requirement |
| --- | --- | --- |
| macOS | ARM64 (Apple silicon) | |
| Linux | x64 | glibc 2.28 or newer (RHEL and Rocky 8+, Debian 10+, Ubuntu 20.04+, Amazon Linux 2023); a CPU with x86-64-v2 |
| Linux | ARM64 | glibc 2.28 or newer; ARMv8.2 with LSE atomics and dot product (Neoverse N1, AWS Graviton 2 and newer; not a Raspberry Pi 4) |
| Windows | x64 | A CPU with x86-64-v2 |

Not supported: Intel Macs, musl-based Linux such as Alpine, and Windows on ARM.

Each build is one native binary with no runtime dependency: the npm launcher needs Node, the binary does not.

## npm

```sh
npm install --global @mutationhq/cli
mutation --version
```

`npm install --global mutation` would install the unrelated package above: always include the `@mutationhq/` scope.

npm installs `@mutationhq/cli` and, through its optional dependencies, only the one platform package that matches your system. No install script runs. If your package manager skips optional dependencies (`--omit=optional`, `--no-optional`), `mutation` cannot find its binary and says so; install again with optional dependencies included.

pnpm and Yarn work the same way: `pnpm add --global @mutationhq/cli`, or add `@mutationhq/cli` as a dev dependency of a project and run it with `pnpm exec mutation`.

## npx

```sh
npx @mutationhq/cli --help
```

## Homebrew (macOS and Linux)

```sh
brew install mutationhq/tap/mutation
```

The formula lives in [mutationhq/homebrew-tap](https://github.com/mutationhq/homebrew-tap) and installs the prebuilt binary of each release. Always give the full name `mutationhq/tap/mutation`: it cannot be confused with a formula of the same short name elsewhere.

## Mirrors, proxies and caches

A copy fetched through a registry mirror, your organization's npm proxy, a CDN such as unpkg or jsDelivr, or a CI cache is covered by the licence when it is byte-identical to Mutation's release (licence section 3.2). The [checksums](verifying-releases.md) confirm it. Publishing the binary yourself, repackaged or under another name, is not allowed.

## Archives

Each [GitHub Release](https://github.com/mutationhq/cli/releases) carries one archive per platform: `mutation-<version>-macos-arm64.tar.gz`, `mutation-<version>-linux-x64.tar.gz`, `mutation-<version>-linux-arm64.tar.gz` and `mutation-<version>-windows-x64.zip`. Each holds, at its root, the binary, `LICENSE-BINARY` (its licence), `THIRD-PARTY-NOTICES`, `README.md` and `LICENSE` (the MIT licence of that README). Check the archive before you unpack it ([verifying releases](verifying-releases.md)), then put the folder on your `PATH`, keeping its files together so that `mutation` can [update](#updates) itself there.

## Updates

`mutation` looks for a newer release once a day, in the same place it was installed from, and, by default, installs it in the background, so the next start runs it. It never takes a release published less than 24 hours earlier, a pre-release, or a version older than the one it runs. A command never waits for it, and its output and exit code never depend on it.

| Installed with | What happens |
| --- | --- |
| `npm install --global` (Linux, macOS) | `npm install --global --prefix <the same prefix> @mutationhq/cli@<version>`, run in the background, never with `sudo` |
| `npm install --global` (Windows) | A notice with the npm command: Windows cannot replace a program while it runs |
| pnpm, Bun or Yarn, globally | A notice with that manager's command |
| Homebrew | A notice: `brew upgrade mutationhq/tap/mutation`. Homebrew upgrades its own formulae |
| An archive, unpacked in place | The new archive is downloaded, its signed `SHA256SUMS` and its checksum verified ([verifying releases](verifying-releases.md)), and the binary replaced. Keep `LICENSE-BINARY` beside the binary: a binary copied away from it is never replaced, only told of new versions |
| `npx`, or a project's dependency | Nothing: npx and your lockfile choose the version |

Where `mutation` cannot write its own folder, or an update fails, it tells you instead, once a day, on stderr when stderr is a terminal, with the command to run.

**In CI nothing of this runs**, not even the check: the version a pipeline installed is the one it runs. CI is recognized by `CI` and the variables each CI service sets (GitHub Actions, GitLab, Jenkins, Azure Pipelines, CircleCI, Buildkite and about 50 more, the list of [ci-info](https://github.com/watson/ci-info)). A pipeline that sets none of them should set `CI=true`, or `MUT_UPDATE=off`.

To turn updates off: `update: off` in your `config.yml` ([configuration](configuration.md)), `MUT_UPDATE=off`, or `NO_UPDATE_NOTIFIER=1`; `update: notify` keeps the notices without installing. The checks need `curl`, which macOS, Windows 10 and later and Linux distributions include. What they send is in the [privacy notice](privacy.md). Their state is a small file in your cache folder: `~/Library/Caches/mutation` on macOS, `$XDG_CACHE_HOME/mutation` or `~/.cache/mutation` on Linux, `%LOCALAPPDATA%\mutation` on Windows.

## Shell completions

```sh
mutation completions bash > ~/.local/share/bash-completion/completions/mutation
mutation completions zsh > "${fpath[1]}/_mutation"
```

## Uninstall

```sh
npm uninstall --global @mutationhq/cli
brew uninstall mutationhq/tap/mutation
```

Mutation keeps its data in each repository's `.mutation/` folder, its settings in the user's `config.yml` ([configuration](configuration.md)) and the state of its updates in the cache folder named under [updates](#updates); remove them by hand if you want them gone.
