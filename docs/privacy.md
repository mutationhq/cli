# Privacy notice: the `mutation` CLI

Version 1.1, effective 2026-11-24. Applies to `mutation` 0.1.0 and later until a new version of this notice replaces it. This is the Privacy Notice that the [Mutation CLI License](../LICENSE-BINARY) (section 7) refers to; capitalized terms (Software, Telemetry, Official Channels) mean what the licence defines.

## Who we are

Mutation.sh ("Mutation") is responsible for the processing this notice describes. Contact: support@mutation.sh. When a version of the Software first sends Telemetry, this notice will name Mutation's representatives in the European Union and the United Kingdom where the law requires them.

## Your code stays on your machine

`mutation` reads your repositories and writes its results on your machine. It does not send your code, file names, paths, repository names, queries or results to Mutation or anyone else, unless you use a feature that you start for the purpose of sending them to a Mutation service, which then has its own terms. Mutation does not process the personal data that may be inside your repositories; you decide what to run it on.

## What each version sends

| Versions | Network feature | What is sent | To whom | Why | How to turn it off |
| --- | --- | --- | --- | --- | --- |
| 0.1.0 and later, until a row below says otherwise | None | Nothing: these versions are built to open no network connection of their own | | | |

A version sends nothing that this table does not list for it. Each later version that adds a network feature, or Telemetry, adds a row here, and updates this notice, before it is released.

## Usage data (Telemetry)

No version sends Telemetry yet. Mutation plans to add it, and this section sets the rules it will follow, so that what you read today stays true when it arrives.

- **When it is sent.** In the free Software, Telemetry is always on once a version sends it: it is a condition of the free licence (section 7.4 of the [Mutation CLI License](../LICENSE-BINARY)) and cannot be turned off. If you do not want it sent, do not use the free Software. A paid agreement with Mutation that covers the CLI lets you turn it off (opt-out). The first version that sends Telemetry shows this on its first run and in `mutation --help`.
- **Controls, with a paid agreement.** Any of these turns Telemetry off: `telemetry: off` in your `config.yml`, `MUT_TELEMETRY=off`, or `DO_NOT_TRACK=1`. In the free Software these settings are accepted and have no effect. Today's versions send nothing and do not know these settings yet: they refuse `MUT_TELEMETRY` and the `telemetry` key as unknown ([configuration](configuration.md)).
- **What may be sent:** the CLI version; the operating system and its version; the CPU architecture; how it was installed (npm, Homebrew, an archive); the command and subcommand name, never its arguments or flag values; the stable error code from [exit codes](exit-codes.md), never the message; the exit code; durations and sizes rounded into ranges; whether it runs in CI; and, only if the version's row says so, a random installation identifier created on your machine, not derived from its hardware, which you can reset and which is deleted when you turn Telemetry off.
- **What is never sent:** the contents of your repositories; file, folder or repository names; paths; remote URLs; branch names; commit hashes; queries; settings files; environment variables; user or host names; email addresses; error text or stack traces; or a hash of any of these.
- **Your IP address** reaches the receiving server as part of the connection. The endpoint discards it on receipt and does not log it, and any provider that runs the endpoint is bound to the same.
- **Purpose and legal basis:** to understand how the CLI is used and where it fails, so it can be improved. The basis is Mutation's legitimate interest (Article 6(1)(f) GDPR) and, where Article 5(3) of Directive 2002/58/EC or its UK equivalent requires consent, your consent, given by using the free Software after this notice was made available to you and withdrawn by no longer using it. The data is kept as small as the lists above allow, so that it identifies no one.
- **Retention:** individual events for at most 90 days; after that, only totals that cannot be linked to an installation.
- **Recipients and transfers:** the row that adds Telemetry names each provider that receives the data, its country, and the safeguard for any transfer outside the EU or the UK.

## When you contact us

If you email support@mutation.sh, Mutation uses your name, address and message to answer you and, for a security report, to fix the issue and credit you if you wish. The mailbox is run by Zoho Mail in Zoho's data centres in the European Union, under Zoho's data processing agreement. The legal basis is Mutation's legitimate interest in supporting users and securing the product (Article 6(1)(f) GDPR) and, for security reports, its legal obligations under Regulation (EU) 2024/2847 (Article 6(1)(c) GDPR). Mutation keeps this correspondence for two years after the matter is closed.

## Where you get the CLI

npm, GitHub and Homebrew process data about your downloads under their own privacy notices; Mutation receives at most download totals from them. Homebrew collects its own usage analytics unless you turn them off (`brew analytics off`). A registry mirror, proxy or cache you use processes data under its operator's terms.

## United States

With a paid agreement, `DO_NOT_TRACK=1` turns Telemetry off, as described under Usage data; the free Software sends Telemetry regardless of it. Before the version that adds Telemetry is released, this section will state the rights that US state privacy laws give you, where Mutation meets their thresholds.

## Your rights

You can ask Mutation for access to, correction or deletion of your personal data, restriction of or objection to its processing, and its portability (Articles 15 to 21 GDPR, and the UK GDPR). Usage data carries no name, so Mutation may be unable to find yours unless you give it your installation identifier, where a version has one. You can complain to the data protection authority where you live or work; in the UK, the Information Commissioner's Office. No decision with legal effect is made about you by automated means.

## Changes

Each version of this notice is published here with its effective date, and its history is this file's history in git. If Mutation changes what the CLI sends, this notice is updated before the version that sends the new data is released.
