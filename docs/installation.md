# Installation

> Version 0.1.0 is not published yet. Each method below describes how `mutation` will install once it is.

By installing or using `mutation` you accept the [Mutation CLI License](../LICENSE-BINARY): free of charge for any use, with the rights and limits it states. The [privacy notice](privacy.md) says what each version sends over a network.

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

Each [GitHub Release](https://github.com/mutationhq/cli/releases) will carry one archive per platform: `mutation-<version>-<os>-<arch>.tar.gz`, and `.zip` on Windows. Each holds the binary, `LICENSE-BINARY` (its licence), `THIRD-PARTY-NOTICES`, `README.md` and `LICENSE` (the MIT licence of that README). Check the archive before you unpack it ([verifying releases](verifying-releases.md)), then put `mutation` on your `PATH`.

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

Mutation keeps its data in each repository's `.mutation/` folder and its settings in the user's `config.yml` ([configuration](configuration.md)); remove them by hand if you want them gone.
