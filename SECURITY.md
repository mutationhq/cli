# Security policy

Version 1.2, effective 2026-11-24. The coordinated vulnerability disclosure policy for `mutation`, the command line of Mutation, published by Mutation.sh, support@mutation.sh ("Mutation"). Capitalized terms (Software, Official Channels, Unauthentic Copy, Compromise Event) mean what the [Mutation CLI License](LICENSE-BINARY) defines; [legal documents](docs/legal.md) lists the others.

## Report a vulnerability

Mutation's single point of contact for security is **support@mutation.sh**. Do not open a public issue, pull request or discussion for a vulnerability.

Please include:

- the version (`mutation --version --format json`) and your system;
- what an attacker can do, and the steps or input that show it (a repository, a settings file, a patch);
- whether anyone else knows of it.

## What we do

The times below are targets, not contractual promises: section 13.1 of the licence says so, and section 8.5 governs notices of a Compromise Event.

- We aim to acknowledge your report within 3 working days and to give you a first assessment within 10 working days.
- We keep you informed until the issue is fixed, and agree a disclosure date with you. Our target is a fix within 90 days of the report; we may ask for more time for a complex issue, and we disclose sooner if the vulnerability is actively exploited.
- Once a fix is released, we publish an advisory with a description, the affected and fixed versions, its severity (CVSS) and, where one is assigned, a CVE identifier, in this repository's [security advisories](https://github.com/mutationhq/cli/security/advisories) and the release notes. We may hold back details while users need time to update.
- We credit you in the advisory unless you ask us not to.
- Where the law requires it, we notify actively exploited vulnerabilities and severe incidents to the competent CSIRT and to ENISA, under Article 14 of Regulation (EU) 2024/2847 (the Cyber Resilience Act), and tell affected users what to do.
- If the vulnerability is in a component we use, we report it to that component's maintainer as well.

## Good faith research

We will not pursue or support legal action against you for research that follows this policy: you act in good faith, test only against your own installation and data, do not access or change other people's data, do not degrade any service, and give us reasonable time to fix the issue before you disclose it. Section 4 of the licence permits the disassembly that such research needs, to the extent needed to find, show and report a vulnerability. This does not authorize access to Mutation's hosted service or to any third party's systems.

## Install only from the Official Channels

Mutation publishes `mutation` only through:

- the npm packages under the `@mutationhq` scope (`@mutationhq/cli` and its four platform packages);
- the Homebrew formula in [mutationhq/homebrew-tap](https://github.com/mutationhq/homebrew-tap), installed as `brew install mutationhq/tap/mutation`;
- the [GitHub Releases](https://github.com/mutationhq/cli/releases) of this repository.

A byte-identical copy of one of these served by a registry mirror, a package proxy, a CDN or your organization's cache is the same release, and the checksums below confirm it. The npm package named `mutation` without a scope is not Mutation's.

Mutation never asks you to install it from anywhere else: not from a link in an email, a chat message, an issue comment or another website, and not from a package under another name or scope. Treat any such request as an attack, and report it to support@mutation.sh.

## Verifying a release

Starting with 0.1.0, each release carries a `SHA256SUMS` file, a cosign signature of it made with the release key (`cosign.pub` in this repository's root, published with 0.1.0), and a provenance statement for each archive. The macOS binary is signed with an Apple Developer ID and notarized; the Windows binary is signed with Authenticode. Before you use a download:

```sh
cosign verify-blob --key cosign.pub --bundle SHA256SUMS.sigstore.json SHA256SUMS
sha256sum --check --ignore-missing SHA256SUMS    # macOS: shasum -a 256 --check --ignore-missing SHA256SUMS
```

From 0.1.0, the fingerprint of `cosign.pub` is also published at https://mutation.sh/security, so you can check the key independently of this repository. [Verifying releases](docs/verifying-releases.md) has every step. A file that fails any of them may have been tampered with: do not run it, and report it to support@mutation.sh. Whether you check is your decision; for business use, the risk of not checking is yours (section 8.4 of the licence).

## Compromise of a release or channel

When Mutation becomes aware that a release, a package, the Homebrew formula, a signing key or one of its accounts has been compromised (a Compromise Event, or an Unauthentic Copy published through an Official Channel), it uses commercially reasonable efforts to publish an advisory here, deprecate or withdraw the affected versions and revoke the affected keys, then publishes a clean release. The licence to the affected versions ends with that advisory (section 8.6 of the licence); the latest version stays free to install. Notifications the law requires, such as those of the Cyber Resilience Act, are made as the law requires. Report a file that fails verification, or a package under Mutation's name that Mutation did not publish, to support@mutation.sh.

## In scope

The `mutation` binaries, the npm packages and launcher in this repository, the release archives and their signatures, the Homebrew formula, the release and signing process, and any network feature or Telemetry endpoint of the CLI once a version has one. For example: a repository's content (files, names, settings, history) that makes `mutation` run code, write outside its own files, exhaust memory, disk or time without bound, or put active content into an HTML, Markdown or SARIF output.

## Support period

The free `mutation` comes with no promised support period: Mutation may fix a vulnerability in a new version, and only the latest version is updated; you can always update to it free of charge through any Official Channel. What the law requires (including, once its obligations apply, the EU Cyber Resilience Act's vulnerability handling) is done regardless. A paid agreement with Mutation that covers the CLI states its own support and updates, for its paid term.

| Version | Security updates |
| --- | --- |
| Latest release | Yes, from its release |
| Older releases | No: update to the latest |
