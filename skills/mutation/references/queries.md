# Queries over the code graph

`mutation query sql` reads `mutationql/1`: standard SQL with SQL/PGQ's `GRAPH_TABLE` for graph patterns and SQL:2011's `FOR SYSTEM_TIME` for history. `mutation query cypher` reads a read-only subset of openCypher, compiled into the same patterns. Pass the query as an argument, or `-` to read it from stdin.

Run `mutation query catalog` first: it lists every relation, column, node kind, edge label, metric and function that this index holds. The names below are the main ones; the catalog is the authority.

## Relations

| Relation | What a row is |
| --- | --- |
| `definitions` | A definition: `key`, `kind`, `label` (its name), `family`, its place, `module`, `signature` |
| `uses` | A use of a definition inside another: a call, a read, a write, a construction or an import, with its place and target |
| `code.nodes` | A node of the graph (repository, directory, module, file, type, function, field, parameter, region, block, call, site) with its place, module and metrics |
| `code.edges` | An edge: `CALLS`, `REFERS`, `IMPORTS`, `EXTENDS`, `IMPLEMENTS`, `OVERRIDES`, `CONTAINS`, `DEFINES` |
| `metrics` | `key`, place, `metric`, `value`, `level` for files, definitions, folders and modules |
| `commits`, `commit_files` | The history: each commit and the files it changed, with lines added and removed |
| `coverage`, `undecided` | What an answer did not read or resolve, and uses whose target is not one definition |
| `catalog.*` | What the index builds: kinds, edges, measures, functions, views, columns, languages |

A place is a path, a line counted from 0, and start and end offsets in UTF-8 bytes.

## Functions

Topology: `impact`, `cheapest_path`, `scc`, `reach`, `cores`, `bridges`, `depth`, `betweenness`, `pagerank`, `propagation_cost`, `modularity`. Change and history: `hotspots`, `coupled`, `cochange_matrix`, `metric_delta`, `change_size`, `became`. Redundancy: `clones('exact')`, `clones('renamed')`, `similar()`, `wrappers()`, `unused_exports()`. Text: `texts`. Control flow: `cfg`, `dominators`. Their arguments are in the catalog.

## Recipes

Start from what a built-in kind runs, then adapt it:

```sh
mutation query callers app::run --print-sql     # the SQL behind callers
mutation query catalog --format json            # the schema, for a program
```

Definitions by kind:

```sql
SELECT key, label FROM definitions WHERE kind = 'Function' LIMIT 20
```

Callers of a definition two hops out, with SQL/PGQ:

```sql
SELECT * FROM GRAPH_TABLE (code
  MATCH (caller)-[:CALLS]->{1,2}(target WHERE target.key = 'app::run')
  COLUMNS (caller.key AS caller))
```

The same in openCypher:

```sh
mutation query cypher "MATCH (c)-[:CALLS*1..2]->(t {key: 'app::run'}) RETURN c.key"
```

Import cycles between modules:

```sql
SELECT * FROM scc('IMPORTS')
```

## Answers

- Every answer states what it did not cover: rows past `--rows` (1,000 by default), files skipped, links not resolved. With `--exact`, an inexact answer exits 4.
- `--at REV`, `--at A..B` or `--at worktree` picks the revision. A comparison answers over both sides.
- `--format json`, `jsonl`, `csv` or `graphml` for programs; `text` for people.
