# Commands, inputs and exit codes

The full reference is [docs/commands.md](https://github.com/mutationhq/cli/blob/main/docs/commands.md). This page holds what an agent needs most.

## Inputs

| Input | Written | What is analyzed |
| --- | --- | --- |
| The worktree | nothing, or `worktree` | Tracked files and untracked ones not ignored, as `git add` would store them |
| A revision | `REV` (git's syntax) | That commit's tree |
| A comparison | `A..B`, or `A...B` from the merge base | Head `B` against base `A` |
| A patch | `--patch FILE\|-` with `--at REV` | The patch applied in memory to `REV`; files and git's index untouched |
| A history | `--history A..B` or `--history N` | The first-parent commits of the span |

## verify

```
mutation verify [REV|A..B] [--patch FILE|- --at REV] [--workflow incremental|comprehensive]
                [--settings REV] [--probes IDS] [--fail-on new|blocking|none] [--require complete|any]
```

With no argument, it verifies the worktree against HEAD in the incremental workflow. It decides `pass` (exit 0), `fail` (exit 3) or `incomplete` (exit 4).
- `--fail-on new` fails only on new blocking findings; this is the default for a change.
- `--workflow comprehensive` runs every probe on one revision.
- Formats: `text`, `json`, `sarif`, `codeclimate`, `markdown`, `html`. `--output FMT=FILE` writes another format beside it.

## context

```
mutation context [TARGET...] [--at REV|A..B|worktree] [--budget N] [--depth N]
```

The code around targets, within `--budget` tokens (8,000 by default) and `--depth` hops (2 by default). Without a target, it gives the context of the worktree's changes. Formats: `markdown`, `xml`, `json`. Past the budget, it exits 4.

## query

```
mutation query <kind> ... [--at REV|A..B|worktree] [--rows N] [--exact] [--print-sql]
```

The kinds are `sql`, `cypher`, `find` (`--fuzzy`), `definition`, `outline`, `references`, `callers`, `callees`, `impact` (`--bound N`, 64 by default), `path`, `diff`, `text`, `metrics` and `catalog`.

## Global options

`-C DIR`, `--format F`, `--output FMT=FILE`, `--threads N`, `--no-update` (answer from what is indexed, exit 4 past it), `--config FILE`, `--color auto|always|never`, `-q`.

## Exit codes

| Code | Meaning | Error codes |
| --- | --- | --- |
| 0 | Done; `verify` decided pass | |
| 1 | Failed: I/O, an output not written, a corrupt or incompatible data file | `io`, `output`, `corrupt`, `incompatible` |
| 2 | Usage: arguments, configuration, or a revision, key or patch that does not resolve | `usage`, `config`, `revision_unknown`, `key_unknown`, `key_ambiguous`, `patch_rejected` |
| 3 | `verify` decided fail | `findings` |
| 4 | Incomplete answer or decision | `inexact`, `not_indexed`, `over_budget`, `incomplete` |
| 130 | Interrupted | `interrupted` |

An error is one line on stderr. Under `--format json` it is one JSON line instead: `{"format":{"name":"mutation-error","version":1},"exit":2,"error":{"code":"key_unknown","message":"...","fix":"..."}}`. Match on `code`.
