# Commands

Every command below parses its arguments in full and refuses an invalid combination with exit 2. A command marked **Not implemented** then exits 5 (`not_implemented`), and `mutation --help` marks it the same way. Nothing on this page marked Not implemented works in 0.1.0.

Data goes to stdout; errors, progress and completeness go to stderr. Human text is the default, and a machine format is chosen with `--format`, never by whether stdout is a terminal.

## Global options

| Option | Meaning |
| --- | --- |
| `-C DIR` | Run as if started in `DIR` |
| `--format F` | The format of the results: `text`, `json`, `jsonl`, `csv`, `graphml`, `sarif`, `codeclimate`, `markdown`, `html`, `xml`, as each command allows |
| `--output FMT=FILE` | Also write the results as `FMT` to `FILE` (`verify`; repeatable). Written aside and renamed in place when whole |
| `--threads N` | The CPUs the work uses (default: each CPU) |
| `--no-update` | Answer from what the data file holds and never index; exit 4 past it |
| `--config FILE` | A machine settings file read over the user's; it must exist |
| `--color auto\|always\|never` | `auto` honours `NO_COLOR` and `CLICOLOR_FORCE` |
| `-q`, `--quiet` | Print nothing on stderr but errors |
| `-V`, `--version` | The version; with `--format json`, the build's details (target, commit, date) |

## Inputs

| Input | Written | What is analyzed |
| --- | --- | --- |
| A revision | `REV` (git's syntax) | That commit's tree |
| A comparison | `A..B`, or `A...B` from the merge base | Head `B` against base `A` |
| The worktree | nothing, or `worktree` | Tracked files and untracked ones not ignored, as `git add` would store them |
| A patch | `--patch FILE\|-` with `--at REV` | The patch applied in memory to `REV`; files and git's index untouched |
| A history | `--history A..B` or `--history N` | The first-parent commits of the span |
| A folder without git | `PATH` | Its files as they are |

## `index` (Not implemented)

```
mutation index [PATH] [--at REV | --history SPAN]
```

Index a revision, or each commit of a history, into the repository's data file (`.mutation/data.mt`), which every worktree of the repository shares. Other commands are designed to index what they read on their own; this one fills the data file ahead. Formats: `text`, `json`. Exits: 0 1 2 5 130.

## `query <kind>` (Not implemented)

```
mutation query <kind> ... [--at REV|A..B|worktree] [--rows N] [--exact] [--print-sql]
```

Answer a question from the index. Each kind runs SQL from the index's catalog, and `--print-sql` shows it. Formats: `text`, `json`, `jsonl`, `csv`, `graphml`. Exits: 0 1 2 4 5 130.

| Kind | Answers |
| --- | --- |
| `sql` | SQL (`mutationql/1`, standard SQL with `GRAPH_TABLE` from SQL/PGQ), as text or `-` for stdin |
| `cypher` | Read-only openCypher |
| `find` | Definitions by name (`--fuzzy`) |
| `definition` | Where a definition is |
| `outline` | The definitions of a file or a definition, as a tree |
| `references` | Every reference to a definition |
| `callers` | What calls a definition |
| `callees` | What a definition calls |
| `impact` | What depends on a definition, within `--bound` hops (64 by default) |
| `path` | A path of calls from one definition to another |
| `diff` | What changed between two revisions, definition by definition |
| `text` | Search the text of the indexed files |
| `metrics` | The measures of a file, a definition or the repository |
| `catalog` | What the index holds: its tables, kinds and probes |

A key is a definition's qualified name (`app::run`). One that names nothing, or several, is designed to exit 2 (`key_unknown`, `key_ambiguous`) with the nearest names. `--rows` limits the rows (1,000 by default); `--exact` makes an inexact answer exit 4.

## `verify` (Not implemented)

```
mutation verify [REV|A..B] [--patch FILE|- --at REV] [--workflow incremental|comprehensive]
                [--history SPAN] [--settings REV] [--probes IDS] [--sections S]
                [--fail-on new|blocking|none] [--require complete|any]
```

Verify a change: run the probes of the workflow on the change and its base, compare their findings, and decide `pass`, `fail` or `incomplete`. With no argument, the worktree against HEAD, in the incremental workflow.

- `--workflow comprehensive` runs every probe on one revision.
- `--fail-on` picks which blocking findings fail: `new` (new or undetermined, the incremental default), `blocking` (all, the comprehensive default) or `none`. Incomplete work still fails under `none`.
- `--require complete` (the default) decides `incomplete` when required work did not complete; `any` accepts what was measured.
- `--settings REV` reads `mutation.yml` at a pinned revision, as CI pins the target branch; otherwise the base's file is read.

Formats: `text`, `json`, `sarif` (2.1.0), `codeclimate` (GitLab's Code Quality), `markdown`, `html` (one self-contained file). Exits: 0 1 2 3 4 5 130. The CLI writes files; it does not publish results to a git host.

```sh
mutation verify main..HEAD --format sarif > results.sarif
git diff | mutation verify --patch - --at main
mutation verify --workflow comprehensive HEAD --output html=report.html
```

## `context` (Not implemented)

```
mutation context [TARGET...] [--at REV|A..B|worktree] [--budget N] [--depth N]
```

Give the code around targets for an agent, within a budget of tokens (8,000 by default; tokens estimated as UTF-8 bytes divided by 4), up to `--depth` hops (2 by default). Without a target, the worktree's changes. Each excerpt carries its path and original lines. Formats: `markdown`, `xml`, `json`. Exits: 0 1 2 4 5 130.

## `watch` (Not implemented)

```
mutation watch [--workflow incremental|comprehensive] [--probes IDS]
```

Verify the worktree each time it changes, one JSON line an event, each with its input's identity. Format: `jsonl`. Exits: 0 1 2 5 130.

## `config` (Built)

| Subcommand | What it does | Exits |
| --- | --- | --- |
| `config show [--at REV] [--settings REV]` | The repository settings `verify` would apply (HEAD's by default), each key with its origin, the file's revision, digest and trust; and the machine settings, each with its source | 0 1 2 |
| `config validate [FILE\|-]` | Check one settings file as Mutation reads it, by default the worktree's; each invalid field with its line and column | 0 2 |
| `config schema [repository\|machine]` | The JSON Schema of a settings file | 0 |
| `config init [--dry-run]` | Write `mutation.yml` with every default; never replaces an existing file | 0 1 |

Formats: `text`, `json`. See [configuration](configuration.md).

## `completions` (Built)

```sh
mutation completions bash > ~/.local/share/bash-completion/completions/mutation
mutation completions zsh > "${fpath[1]}/_mutation"
mutation completions fish > ~/.config/fish/completions/mutation.fish
```

Shells: `bash`, `zsh`, `fish`, `powershell`, `elvish`. Exits: 0 2.

## `debug` (unstable)

Measurements for Mutation's own benchmarks. Their arguments and output change between releases without notice; scripts should not depend on them.

| Command | Status |
| --- | --- |
| `debug index` | Built: reads a folder or commits and prints its figures |
| `debug shares` | Built: prints the tree of memory's accounts |
| `debug detect [PATH]` | Built: each file's language and the step that decided, one JSON line a file |
| `debug data verify [--at REV]` | Not implemented |
