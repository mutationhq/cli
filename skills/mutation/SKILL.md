---
name: mutation
description: Verify a code change and answer questions about a repository's code with the Mutation CLI (`mutation`). Use it to find who calls a function, what a change impacts, where a definition is, the references to it, a call path between two definitions, metrics, or any question over the code graph in SQL or openCypher; to gather the code around a target within a token budget before editing; and to verify your changes (`mutation verify`) before you say a task is done. Prefer it over grep for questions about definitions, calls and dependencies.
license: MIT
compatibility: Requires the `mutation` CLI on PATH (npm install --global @mutationhq/cli, or brew install mutationhq/tap/mutation), run inside a git repository or a folder of source files.
---

# Mutation CLI

`mutation` indexes a repository into a code graph (definitions, references, calls, dependencies, metrics) and answers from it. It reads git directly: the worktree, any revision, a comparison or a patch. Answers come from the index, never from re-reading files, so they are fast and the same for every caller.

## The loop

1. **Before editing**, understand the target:
   - `mutation query find <name> --fuzzy` to get a definition's exact key.
   - `mutation context <key> --budget 8000` for the code around it, as Markdown with paths and line numbers.
   - `mutation query callers <key>` and `mutation query impact <key>` to see what your change can break.
2. **Edit.**
3. **Before saying you are done**, run `mutation verify`. It compares your uncommitted changes with HEAD.
   - Exit 0: pass.
   - Exit 3: your change adds blocking findings. Read them, fix them and run it again.
   - Exit 4: the decision is incomplete. Say so; never report it as a pass.

`mutation verify main..HEAD` verifies a branch. `git diff | mutation verify --patch - --at main` verifies a patch without touching the worktree.

## Keys

A definition's key is its qualified name (`app::run`). If you are unsure of a key, use `query find` first, which prints each match's key. A key that names nothing exits 2 (`key_unknown`), and one that names several exits 2 (`key_ambiguous`); both print the nearest names, so pick one and run the command again.

## Queries

| Question | Command |
| --- | --- |
| Where is it defined? | `mutation query definition <key>` |
| What is in this file? | `mutation query outline <path>` |
| Who uses it? | `mutation query references <key>` |
| Who calls it? What does it call? | `mutation query callers <key>`, `mutation query callees <key>` |
| What breaks if it changes? | `mutation query impact <key> --bound 3` |
| How does A reach B? | `mutation query path <from> <to>` |
| What changed, definition by definition? | `mutation query diff main..HEAD` |
| Text search over the indexed files | `mutation query text '<pattern>'` |
| Size and complexity | `mutation query metrics <path-or-key>` |
| Anything else | `mutation query sql '...'` or `mutation query cypher '...'` |

Before writing SQL or openCypher, run `mutation query catalog` to see the tables, kinds and columns. Never guess the schema. Every query kind accepts `--print-sql` to show the SQL it runs, which is a good start for your own query. See [references/queries.md](references/queries.md).

## Output for agents

- Use `--format json` (or `jsonl` for streams) whenever you parse the output; the text form is for people.
- Results go to stdout, and errors and completeness to stderr.
- Under `--format json`, an error is one JSON line with `exit`, `error.code`, `error.message` and `error.fix`. Match on `code`, never on the message.
- `--rows N` limits rows (1,000 by default). Without `--exact`, an answer cut at its limit says so. With `--exact`, it exits 4.
- `--at REV`, `--at A..B` or `--at worktree` picks what a query reads (default: the worktree).

## Rules

- Run `mutation` from inside the repository, or pass `-C <dir>`.
- The first command indexes the repository into `.mutation/data.mt`; later ones read only what changed. Don't delete that folder to "refresh" it.
- Don't rewrite `mutation.yml` to make `verify` pass. Fix the code, or tell the user which setting blocks the change.
- Report what `verify` decided, with its findings, and never more than it decided.

More: [references/commands.md](references/commands.md) for every command and flag, and the exit codes.
