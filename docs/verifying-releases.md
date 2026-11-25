# Verifying releases

What each release carries and how to check it. The release key's public half is `cosign.pub` in this repository's root.

## What each release carries

| File | What it is |
| --- | --- |
| `mutation-<version>-<os>-<arch>.tar.gz` (`.zip` on Windows), `<os>-<arch>` one of `macos-arm64`, `linux-x64`, `linux-arm64`, `windows-x64` | At its root: the binary (`mutation`, `mutation.exe`), `LICENSE-BINARY`, `THIRD-PARTY-NOTICES`, `README.md` and `LICENSE` (the MIT licence of the README) |
| `mutation-<version>-<os>-<arch>.cdx.json` | The software bill of materials of the binary in that archive (CycloneDX): every component compiled into it, with its version and licence |
| `option-ext-0.2.0.crate` | The source of `option-ext`, the one component under the Mozilla Public License 2.0, included unmodified (see `THIRD-PARTY-NOTICES`) |
| `SHA256SUMS` | The SHA-256 of every archive, bill of materials and source file above |
| `SHA256SUMS.sigstore.json` | A cosign signature of `SHA256SUMS`, made with the release key |
| `<archive>.intoto.sigstore.json` | A provenance statement for each archive: the source commit, the build host's system and architecture, the compiler's version, the build image's digest |

The provenance is self-attested (SLSA Build L1): releases are built on Mutation's own machines, not on a hosted CI service, so they carry no GitHub artifact attestation and no npm provenance.

Beyond these files, the macOS binary is signed with an Apple Developer ID and notarized, and the Windows binary signed with Authenticode.

## Check an archive's checksum

Download the archive and `SHA256SUMS` into one folder, then:

```sh
# Linux
sha256sum --check --ignore-missing SHA256SUMS

# macOS
shasum -a 256 --check --ignore-missing SHA256SUMS
```

```powershell
# Windows (PowerShell): compare with the archive's line in SHA256SUMS
(Get-FileHash .\mutation-<version>-windows-x64.zip -Algorithm SHA256).Hash.ToLower()
```

## Check the signature of `SHA256SUMS`

With [cosign](https://github.com/sigstore/cosign) and `cosign.pub` from this repository, at the release's tag. Its fingerprint is also published at https://mutation.sh/security, so you can check the key independently of this repository:

```sh
cosign verify-blob \
  --key cosign.pub \
  --bundle SHA256SUMS.sigstore.json \
  SHA256SUMS
```

`Verified OK` means `SHA256SUMS` is the one the release key signed, so each archive whose checksum matches is too.

## Check the provenance

```sh
cosign verify-blob-attestation \
  --key cosign.pub \
  --bundle mutation-<version>-<os>-<arch>.tar.gz.intoto.sigstore.json \
  --type slsaprovenance1 \
  mutation-<version>-<os>-<arch>.tar.gz
```

## Check the platform signatures

Run these on the binary unpacked from the archive (with npm, `mutation` on your `PATH` is the launcher, not the binary):

```sh
# macOS
codesign --verify --strict --verbose=2 ./mutation
```

```powershell
# Windows
Get-AuthenticodeSignature .\mutation.exe
```

The npm packages and the Homebrew formula install the same binaries as the archives.

## What `mutation` checks when it updates itself

When `mutation` [updates an archive's installation](installation.md#updates), it makes the first two checks above itself before it replaces anything: the signature of `SHA256SUMS` against the release key built into it (the key of `cosign.pub`), then the archive's SHA-256 against its one line. It does not consult the transparency log. A release that fails either check is not installed, and `mutation` tells you so.

## Whether to check

Checking is your decision. For business use, the risk of running a file you did not check, or one that failed a check, is yours (section 8.4 of the [Mutation CLI License](../LICENSE-BINARY)). A copy stays authentic when an Official Channel's own installer unpacks, relinks, relocates or re-signs it (section 1.2); any other change makes it an Unauthentic Copy. npm and Homebrew do not run cosign for you: npm checks each package against the registry's own integrity hash, and Homebrew checks each archive's SHA-256 against the formula. To check the binary npm installed, compare it with the one in the release archive for your platform.
