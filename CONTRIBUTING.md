# Contributing

Version 1.0, effective 2026-11-24. The section [Licence of contributions](#licence-of-contributions) is a legal term; [legal documents](docs/legal.md) lists the others.

The source of `mutation` is not public, so this repository does not take code changes to the CLI itself. What helps:

- **Bug reports** and **feature requests**, as [issues](https://github.com/mutationhq/cli/issues/new/choose).
- **Fixes to the documentation** in `docs/`, the README and the npm packages' files, as pull requests. Pull requests to the documentation are accepted and reviewed.

Report a vulnerability privately, never in an issue: see [SECURITY.md](SECURITY.md).

## A good bug report

Include:

1. The version and build: the output of `mutation --version --format json`.
2. Your system and how you installed `mutation` (npm, npx, Homebrew, an archive).
3. The exact command you ran, with its working directory if it matters.
4. The exit code: `echo $?` in bash or zsh, `$LASTEXITCODE` in PowerShell.
5. What it printed on stdout and stderr, and what you expected instead.
6. If you can, the smallest repository, settings file or patch that shows it.

Leave out credentials and private code. If the problem only shows on a private repository, describe its shape (size, languages, number of files) instead of sharing it.


## Pull requests

Keep a pull request to one subject, describe what it corrects, and write plain English. Changes to the npm launcher or manifests are reviewed against the release process, and may be taken over into the next release rather than merged as they are.

## Licence of contributions

**Pull requests.** By opening one, you license your contribution under the [MIT License](LICENSE), the licence of this repository's files (the Open Files of the Mutation CLI License), and you certify the [Developer Certificate of Origin 1.1](https://developercertificate.org/) for it. Sign off each commit with `git commit -s`, which adds a `Signed-off-by:` line with your name and email. A pull request whose commits are not signed off is not merged.

**Issues, comments, discussions and other feedback.** By submitting them, you grant Mutation a perpetual, irrevocable, worldwide, royalty-free, fully paid-up, transferable and sublicensable licence to use, copy, modify, disclose and act on them, in any product, including the closed-source `mutation` CLI, with no obligation to you. This is the Feedback licence of section 20 of the [Mutation CLI License](LICENSE-BINARY).

Submit only what you have the right to give on these terms: do not paste code or text that belongs to someone else, confidential information or personal data.

## Code of conduct

Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md).
