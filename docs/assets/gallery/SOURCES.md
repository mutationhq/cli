# Sources of the gallery

Each chart is drawn from the answers of `mutation query` on a public repository, cloned and filled with `mutation cache fill --commits 200`, which indexes up to the newest 200 commits of the first-parent chain of HEAD. The commits each chart names are those of the CLI's `commits` answer: 200 for Cobra and 84 for Tokio. Each query ran as `mutation query --cache <cache> --rows 100000000 [--at <commit>] --sql "..."` from the clone's root, with `--config` setting `cli.threads = 4`.

Every number on a chart is a value of these answers, or a sum, a share or a least-squares slope of them. A slope is the least-squares line through a measure's value at each commit of the window, given per 100 commits. Each chart has a light and a dark version in GitHub's palettes, for a `<picture>` element with `prefers-color-scheme`.

## Every 100 commits add about 490 to Cobra's complexity

`trends-cobra-light.svg`, `trends-cobra-dark.svg`: measures over the commits, each with its least-squares slope per 100 commits.

- Repository: [spf13/cobra](https://github.com/spf13/cobra), commits `89d7b832c7879159ada237e9a528177200f35481` to `adbc8813901bba65827259daa8e22ff94ec1f30e` (HEAD).
- `mutation query --sql "SELECT commit, first_parent, time FROM commits FOR SYSTEM_TIME ALL"`
- `mutation query --sql "SELECT generation, metric, value, status FROM rollup_series('repository', 'size.lines,size.code_lines,complexity.cyclomatic,complexity.cognitive,duplication.lines')"`

## One commit to Tokio's runtime reaches at least 687 functions

`reach-tokio-light.svg`, `reach-tokio-dark.svg`: the functions that depend on what commit cf4ab4f3 changed, by hops along the call graph.

- Repository: [tokio-rs/tokio](https://github.com/tokio-rs/tokio), commits `bd680c73971920d8ab7037686b91834017747598` to `854013a8cb7d1397e9d037315592dc1d2d55187d` (HEAD).
- `mutation query --sql "SELECT commit, first_parent, time FROM commits FOR SYSTEM_TIME ALL"`
- `mutation query --at cf4ab4f3b8605d897d2c3b8cadec9358a890cb6b --sql "SELECT before, after, class, certainty, change, path, line FROM became('c1489e0ef85f00f3590585eab1f1712129834742', 'cf4ab4f3b8605d897d2c3b8cadec9358a890cb6b') WHERE class <> 'unchanged'"`
- `mutation query --at cf4ab4f3b8605d897d2c3b8cadec9358a890cb6b --sql "SELECT i.key, i.depth, n.path FROM impact('tokio::runtime::blocking::pool::LockedImpl::spawn_task', '200') AS i LEFT JOIN code.nodes AS n ON n.key = i.key UNION SELECT i.key, i.depth, n.path FROM impact('tokio::runtime::builder::Builder::build_threaded_runtime', '200') AS i LEFT JOIN code.nodes AS n ON n.key = i.key UNION SELECT i.key, i.depth, n.path FROM impact('tokio::runtime::scheduler::multi_thread::worker::Launch::launch', '200') AS i LEFT JOIN code.nodes AS n ON n.key = i.key"`
- `mutation query --at cf4ab4f3b8605d897d2c3b8cadec9358a890cb6b --sql "SELECT path, class FROM files() WHERE class = 'test'"`

## Where Tokio's code lives, and where it branches most

`treemap-tokio-light.svg`, `treemap-tokio-dark.svg`: the modules of the source directory by lines, coloured by cyclomatic complexity per 100 lines.

- Repository: [tokio-rs/tokio](https://github.com/tokio-rs/tokio), commits `bd680c73971920d8ab7037686b91834017747598` to `854013a8cb7d1397e9d037315592dc1d2d55187d` (HEAD).
- `mutation query --sql "SELECT commit, first_parent, time FROM commits FOR SYSTEM_TIME ALL"`
- `mutation query --sql "SELECT part, number, parent, metric, value, status, name FROM measures_children('directory', 'tokio/src') WHERE part = 'child' OR metric IN ('size.lines', 'complexity.cyclomatic')"`

## Tokio at a glance: every directory and file, sized by its definitions

`hierarchy-tokio-light.svg`, `hierarchy-tokio-dark.svg`: every directory as a circle holding its children, and every file as a dot sized by its definitions, coloured by its top directory. The header figures are the count of files, the sum of their definitions and the count of top directories; the legend gives each top directory's definitions and files.

- Repository: [tokio-rs/tokio](https://github.com/tokio-rs/tokio), commits `bd680c73971920d8ab7037686b91834017747598` to `854013a8cb7d1397e9d037315592dc1d2d55187d` (HEAD).
- `mutation query --sql "SELECT commit, first_parent, time FROM commits FOR SYSTEM_TIME ALL"`
- `mutation query --sql "SELECT key, kind, parent, size FROM hierarchy() WHERE kind <> 'Definition'"`

## Cobra's quality at a glance: 4 of 5 moving measures improve

`quality-cobra-light.svg`, `quality-cobra-dark.svg`: the headline quality measures at HEAD and how each moved over the window. Duplicated lines and comment lines are shares of all lines; the two densities are complexity per 100 lines of code; each has its value at every commit (a sparkline) and its least-squares slope per 100 commits. Test code (the lines of code in files of class `test`, against those of classes `test`, `code` and `source`) and the functions of cognitive complexity over 15 are asked at HEAD and at the oldest commit of the window. Green marks a move the right way, red the wrong way; the title counts the measures that moved.

- Repository: [spf13/cobra](https://github.com/spf13/cobra), commits `89d7b832c7879159ada237e9a528177200f35481` to `adbc8813901bba65827259daa8e22ff94ec1f30e` (HEAD).
- `mutation query --sql "SELECT commit, first_parent, time FROM commits FOR SYSTEM_TIME ALL"`
- `mutation query --sql "SELECT generation, metric, value, status FROM rollup_series('repository', 'size.lines,size.code_lines,size.comment_lines,complexity.cyclomatic,complexity.cognitive,duplication.lines,dependencies.cycles,size.callables')"`
- `mutation query --sql "SELECT f.class, SUM(m.value) AS code_lines FROM files() AS f JOIN metrics AS m ON m.path = f.path WHERE m.metric = 'size.code_lines' GROUP BY f.class"`
- `mutation query --at 89d7b832c7879159ada237e9a528177200f35481 --sql "SELECT f.class, SUM(m.value) AS code_lines FROM files() AS f JOIN metrics AS m ON m.path = f.path WHERE m.metric = 'size.code_lines' GROUP BY f.class"`
- `mutation query --sql "SELECT COUNT(*) AS total FROM code.nodes WHERE kind IN ('function', 'method') AND complexity_cognitive > 15"`
- `mutation query --at 89d7b832c7879159ada237e9a528177200f35481 --sql "SELECT COUNT(*) AS total FROM code.nodes WHERE kind IN ('function', 'method') AND complexity_cognitive > 15"`
