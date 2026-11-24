# Configuration

Two kinds of settings, kept apart: the **repository's** (`mutation.yml`, committed with the code) and the **machine's** (the user's `config.yml`, `MUT_*` variables and flags). A repository's file can never set a machine key, and the machine's settings can never set a repository key.

Both are YAML 1.2, read strictly: values have JSON's types, unknown keys are refused, and a file holds at most 64 KB and 100 items in a list. `mutation config schema repository` and `mutation config schema machine` print each one's JSON Schema.

## The repository's `mutation.yml`

Mutation reads the first of these present at the revision it reads, in this order, on every git host:

1. `.github/mutation.yml` (or `.yaml`)
2. `.gitlab/mutation.yml` (or `.yaml`)
3. `mutation.yml` (or `.yaml`) at the root

`mutation config init` writes `mutation.yml` at the root with every default, and never replaces an existing file.

| Key | Default | Meaning |
| --- | --- | --- |
| `invariants` | `[]` | Rules the repository declares must hold, each with an `id` (kebab-case), a `description` and optionally a `guard` and a `target` function: the target is reached only after the guard |
| `ignore` | `[]` | Shell patterns of paths the analysis skips |
| `review.comments` | `true` | Inline review comments on findings (on a git host, through Mutation's service) |
| `review.request_changes` | `false` | Request changes on blocking findings (on a git host) |
| `review.min_confidence` | `80` | Findings below this confidence (percent) stay off the host conversation. The CLI shows each finding's confidence and never decides by it |
| `summary_comment` | `true` | One summary comment per change request (on a git host) |
| `labels` | `true` | Outcome labels (on a git host) |
| `debug.layers` | `[]` | Unstable: layers for the report's `layers` section |

An invalid file never stops a run: the defaults apply, and the result names the invalid fields. `mutation config validate` reports each with its line and column.

### Which revision's settings

By default, `verify` is designed to read the settings at the **base** of the change (marked `local`), so a change cannot rewrite the settings it is verified against. In CI, `--settings REV` reads them at a revision you pin, such as the target branch's tip (marked `pinned`). Every result records the settings' revision, path, SHA-256 and trust.

## The machine's settings

| Key | Variable | Default | Meaning |
| --- | --- | --- | --- |
| `threads` | `MUT_THREADS` | each CPU | The CPUs the work uses |
| `format` | `MUT_FORMAT` | `text` | The format of the results where a command takes it |
| `color` | `MUT_COLOR` | `auto` | `auto`, `always` or `never` |
| `data` | `MUT_DATA` | the repository's `.mutation/data.mt` | The data file |
| `spill` | `MUT_SPILL` | the system's temporary folder | Where work past memory's share is written |
| | `MUT_CONFIG` | | A settings file read over the user's; it must exist |

The user's file:

| System | Path |
| --- | --- |
| Linux | `$XDG_CONFIG_HOME/mutation/config.yml`, or `~/.config/mutation/config.yml` when `XDG_CONFIG_HOME` is unset |
| macOS | `~/Library/Application Support/mutation/config.yml` |
| Windows | `%APPDATA%\mutation\config.yml` |

### Precedence

Each layer overrides the one before it:

1. The defaults
2. The user's `config.yml`
3. `--config FILE`, or `MUT_CONFIG` (the file must exist)
4. `MUT_*` variables
5. Flags

Any other variable starting with `MUT_` is refused with exit 2 (`config`), naming the allowed ones, so a misspelled variable does not pass unnoticed. `mutation config show` prints each value with where it came from.

```yaml
# config.yml
threads: 8
color: never
```
