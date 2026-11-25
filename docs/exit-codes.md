# Exit codes

Every command exits with one of these codes. Scripts and CI can tell a failing verification (3) from a failure of the tool (1), a usage error (2) and an incomplete answer (4).

| Code | Meaning | Error codes |
| --- | --- | --- |
| 0 | Done; `verify` decided `pass` | |
| 1 | Failed: I/O, an output not written, a corrupt or incompatible data file | `io`, `output`, `corrupt`, `incompatible` |
| 2 | Usage: arguments, configuration, or a revision, key or patch that does not resolve | `usage`, `config`, `revision_unknown`, `key_unknown`, `key_ambiguous`, `patch_rejected` |
| 3 | `verify` decided `fail` | `findings` |
| 4 | Incomplete: an answer under `--exact`, `--no-index` past what is stored, `context` past its budget, `verify` decided `incomplete` | `inexact`, `not_indexed`, `over_budget`, `incomplete` |
| 5 | A feature this build does not have | `not_implemented` |
| 130 | Interrupted (Ctrl-C); the message names the phase reached | `interrupted` |

When several apply, the first of 2, 5, 1, 130, 3, 4 is the exit code.

## Error output

An error is one line on stderr, followed by what is allowed and a fix where there is one:

```
mutation: MUT_THRAEDS is no variable of mutation (config)
  allowed: MUT_CONFIG, MUT_THREADS, MUT_FORMAT, MUT_COLOR, MUT_DATA, MUT_SPILL
  fix: unset MUT_THRAEDS, or correct its name
```

Under a machine format (`--format json`, for example), the error is one JSON line instead:

```json
{"format":{"name":"mutation-error","version":1},"exit":2,"error":{"code":"key_unknown","message":"app::rnu names no definition","fix":"..."}}
```

Scripts should match the `code`, never the message, which may change.

## Incomplete is never a pass

An answer or a decision that did not cover everything says so: a bounded search's frontier, files skipped, rows past a limit, probes not run with their reason. Under `--fail-on none`, `verify` still never turns `incomplete` into `pass`.
