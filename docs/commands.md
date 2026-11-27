# Commands

Every command parses its arguments in full and refuses an invalid combination with exit 2, before it does any work.

`mutation` is also installed as `mut`, the same program by a shorter name: `mut verify` is `mutation verify`, and its help and errors name `mut` (npm's commands on Windows always say `mutation`).

Data goes to stdout; errors, progress and completeness go to stderr. Human text is the default, and a machine format is chosen with `--format`, never by whether stdout is a terminal.

## Global options

| Option | Meaning |
| --- | --- |
| `-C DIR` | Run as if started in `DIR` |
| `--format F` | The format of the results: `text`, `json`, `jsonl`, `csv`, `graphml`, `sarif`, `codeclimate`, `markdown`, `html`, `xml`, as each command allows |
| `--output FMT=FILE` | Also write the results as `FMT` to `FILE` (`verify`; repeatable). Written aside and renamed in place when whole |
| `--threads N` | The CPUs the work uses (default: each CPU) |
| `--no-index` | Answer from what the data file holds and never index; exit 4 past it |
| `--config FILE` | A machine settings file read over the user's; it must exist |
| `--color auto\|always\|never` | `auto` honours `NO_COLOR` and `CLICOLOR_FORCE` |
| `-q`, `--quiet` | Print nothing on stderr but errors |
| `-V`, `--version` | The version; with `--format json`, the build's details (target, date) |

## Inputs

| Input | Written | What is analyzed |
| --- | --- | --- |
| A revision | `REV` (git's syntax) | That commit's tree |
| A comparison | `A..B`, or `A...B` from the merge base | Head `B` against base `A` |
| The worktree | nothing, or `worktree` | Tracked files and untracked ones not ignored, as `git add` would store them |
| A patch | `--patch FILE\|-` with `--at REV` | The patch applied in memory to `REV`; files and git's index untouched |
| A history | `--history A..B` or `--history N` | The first-parent commits of the span |
| A folder without git | `PATH` | Its files as they are |

## `index`

```
mutation index [PATH] [--at REV | --history SPAN]
```

Index a revision, or each commit of a history, into the repository's data file (`.mutation/data.mt`), which every worktree of the repository shares. Other commands index what they read on their own; this one fills the data file ahead. Formats: `text`, `json`. Exits: 0 1 2 130.

## `query <kind>`

```
mutation query <kind> ... [--at REV|A..B|worktree] [--rows N] [--exact] [--print-sql]
```

Answer a question from the index. Each kind runs SQL from the index's catalog, and `--print-sql` shows it. Formats: `text`, `json`, `jsonl`, `csv`, `graphml`. Exits: 0 1 2 4 130.

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

A key is a definition's qualified name (`app::run`). One that names nothing, or several, exits 2 (`key_unknown`, `key_ambiguous`) with the nearest names. `--rows` limits the rows (1,000 by default); `--exact` makes an inexact answer exit 4.

## `verify`

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

Formats: `text`, `json`, `sarif` (2.1.0), `codeclimate` (GitLab's Code Quality), `markdown`, `html` (one self-contained file). Exits: 0 1 2 3 4 130. The CLI writes files; it does not publish results to a git host.

```sh
mutation verify main..HEAD --format sarif > results.sarif
git diff | mutation verify --patch - --at main
mutation verify --workflow comprehensive HEAD --output html=report.html
```

## `context`

```
mutation context [TARGET...] [--at REV|A..B|worktree] [--budget N] [--depth N]
```

Give the code around targets for an agent, within a budget of tokens (8,000 by default; tokens estimated as UTF-8 bytes divided by 4), up to `--depth` hops (2 by default). Without a target, the worktree's changes. Each excerpt carries its path and original lines. Formats: `markdown`, `xml`, `json`. Exits: 0 1 2 4 130.

## `watch`

```
mutation watch [--workflow incremental|comprehensive] [--probes IDS]
```

Verifies the worktree each time it changes, as `mutation verify` with no argument does, and writes one JSON line an event, until you stop it. Format: `jsonl`.

**What starts a run.** A change to a file that `verify` reads (tracked, or untracked and not ignored), and a change of `HEAD` or of git's index: a commit, a checkout, `git add`. Changes to ignored files, `.mutation/` and the rest of `.git/` start nothing.

**Debounce.** A run starts once no change has come for 250 ms, so saving ten files is one run. One run at a time: changes made during a run start one more run after it ends. While git holds its index lock (a commit, a checkout or a rebase step under way), no run starts.

**Branch switches and worktrees.** Each run compares the worktree with `HEAD` as it is when the run starts, so after `git switch` the next run is against the new branch. Every event carries its input's identity (the commit of `HEAD` and the digest of the worktree's files), so you can tell which state a result belongs to. One `watch` serves the worktree it runs in; run one in each worktree you want watched. They share the repository's data file.

**Events.** Each line is the same result as `mutation verify --format json`, on one line, with `event` (`result` or `error`) and `seq`, the run's number from 1 (shortened here):

```text
{"format":{"name":"mutation-watch","version":1},"event":"result","seq":3,"input":{"head":"9f3b8ca6c8","worktree":"sha256:4be1…"},"completeness":"complete","decision":"fail","payload":{"findings":[…]},"error":null}
```

A `fail` or `incomplete` decision is an event, not an exit: `watch` keeps running. When you stop it with Ctrl-C it writes the trailer `{"end":true,...}`, so a reader knows the stream ended whole.

**Exit codes.** 130 when interrupted (Ctrl-C), 0 when the reader of its output closes it (`| head`), 1 when it cannot watch the files, 2 for a usage error, and 5 until it is built.

```sh
# Print each decision as it happens
mutation watch | jq -r --unbuffered 'select(.event == "result") | "\(.seq) \(.decision)"'
```

## `config`

| Subcommand | What it does | Exits |
| --- | --- | --- |
| `config show [--at REV] [--settings REV]` | The repository settings `verify` would apply (HEAD's by default), each key with its origin, the file's revision, digest and trust; and the machine settings, each with its source | 0 1 2 |
| `config validate [FILE\|-]` | Check one settings file as Mutation reads it, by default the worktree's; each invalid field with its line and column | 0 2 |
| `config schema [repository\|machine]` | The JSON Schema of a settings file | 0 |
| `config init [--dry-run]` | Write `mutation.yml` with every default; never replaces an existing file | 0 1 |

Formats: `text`, `json`. See [configuration](configuration.md).

## `install`

```
mutation install hooks [--hook pre-push|pre-commit] [--remove] [--dry-run] [--force]
mutation install agent [--agent auto|claude|codex|kiro|agents-md]... [--remove] [--dry-run] [--force]
```

Set `mutation` up where it runs. Every file or block it writes is marked as Mutation's: running it again changes nothing (`unchanged`), a newer version replaces its own files, and `--remove` deletes only what is marked. `--dry-run` prints the plan, grouped into files to commit and files local to your clone, and the command that applies it.

**`install hooks`** writes a git hook that runs `mutation verify` and exits with its code, so a fail (3) or an incomplete decision (4) stops the push or the commit; `git push --no-verify` skips it once.

- `pre-push` (the default) verifies each branch you push against what the remote holds, or a new branch from its merge base with `origin/HEAD`. Deleting a branch is not verified.
- `pre-commit` verifies the staged changes: `git diff --cached --binary | mutation verify --patch - --at HEAD`.
- The hook goes where git runs hooks (`core.hooksPath`, else `.git/hooks`), or into `.husky/` when the repository has one. With lefthook or the pre-commit framework, it prints the entry to add to their file instead. A hooks folder outside the repository is refused (exit 2), since other repositories may run it.
- If `mutation` is not on `PATH` (nor `npx @mutationhq/cli` installed), the hook says so and lets git go on.

**`install agent`** teaches coding agents the loop:

- the [`mutation` skill](../skills/mutation/SKILL.md) of this `mutation`'s version in `.claude/skills/mutation` (Claude Code), `.agents/skills/mutation` (Codex and other agents) or `.kiro/skills/mutation` (Kiro);
- three lines in a marked block of `AGENTS.md`, created if missing, and for Claude Code an `@AGENTS.md` import in `CLAUDE.md`.

`--agent auto` (the default) picks the agents whose folder is in the repository or your home folder (`.claude`, `.codex`, `.kiro`), a `CLAUDE.md`, or the agent session it runs in; with none found, `AGENTS.md` and `.agents/skills`. It never changes an agent's settings or permissions, and adds no MCP server.

A file of the same name that Mutation did not write is `refused` unless `--force`; the other steps still run, and the command exits 2 with the code `conflict`. Formats: `text`, `json`. Exits: 0 1 2.

```sh
mutation install agent --dry-run     # what it would write, for which agents
mutation install agent
mutation install hooks                # verify each push
```

## `completions`

```sh
mutation completions bash > ~/.local/share/bash-completion/completions/mutation
mutation completions zsh > "${fpath[1]}/_mutation"
mutation completions fish > ~/.config/fish/completions/mutation.fish
```

Shells: `bash`, `zsh`, `fish`, `powershell`, `elvish`. Exits: 0 2.

## `debug` (unstable)

Measurements for Mutation's own benchmarks. Their arguments and output change between releases without notice; scripts should not depend on them.

| Command | What it does |
| --- | --- |
| `debug index` | Reads a folder or commits and prints its figures |
| `debug shares` | Prints the tree of memory's accounts |
| `debug detect [PATH]` | Each file's language and the step that decided, one JSON line a file |
| `debug data verify [--at REV]` | Checks the data file's records against their digests |
