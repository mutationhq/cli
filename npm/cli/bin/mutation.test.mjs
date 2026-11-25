// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Mutation.sh. See the file LICENSE in this package.
//
// The launcher's tests, on Node's own runner (`node --test npm/cli/bin/`): its layout on each system, by an
// injected platform and environment; and its update, run whole on a temporary npm prefix with a fake binary
// (a copy of Node that a preloaded script answers for) and a fake npm. Each check is a function that returns
// what it found wrong, so that each one also runs against a planted defect of the launcher and must find it.

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { constants, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const sources = { launcher: readFileSync(join(here, "mutation.mjs"), "utf8"), layout: readFileSync(join(here, "layout.mjs"), "utf8") };
const scratch = () => realpathSync(mkdtempSync(join(tmpdir(), "mutation-launcher-")));

// `text` with each pair of `edits` replaced, each found exactly once.
const planted = (text, edits) =>
  edits.reduce((done, [from, to]) => {
    assert.equal(done.split(from).length, 2, `the planted defect's text is in the launcher once: ${from}`);
    return done.replace(from, to);
  }, text);

// The layout function of `text`, loaded from a file of its own.
const loaded = async (text) => {
  const file = join(scratch(), "layout.mjs");
  writeFileSync(file, text);
  return (await import(pathToFileURL(file).href)).layout;
};

const marker = (cache, p) => p.join(cache, "mutation", "update-npm.pending");

// Each system's layout: npm's prefix and global folder, the cache folder and its marker; none outside npm's
// global folder or without a cache folder.
const checkLayout = (layout) => {
  const wrong = [];
  const unix = "/p/lib/node_modules/@mutationhq/cli/bin/mutation.mjs";
  const windows = "C:\\p\\node_modules\\@mutationhq\\cli\\bin\\mutation.mjs";
  const cases = [
    ["linux, XDG absolute", { file: unix, platform: "linux", env: { XDG_CACHE_HOME: "/x" }, home: "/h" }, { prefix: "/p", modules: "/p/lib/node_modules", marker: "/x/mutation/update-npm.pending" }],
    ["linux, XDG relative", { file: unix, platform: "linux", env: { XDG_CACHE_HOME: "x" }, home: "/h" }, { prefix: "/p", modules: "/p/lib/node_modules", marker: "/h/.cache/mutation/update-npm.pending" }],
    ["linux, no XDG", { file: unix, platform: "linux", env: {}, home: "/h" }, { prefix: "/p", modules: "/p/lib/node_modules", marker: "/h/.cache/mutation/update-npm.pending" }],
    ["macOS", { file: unix, platform: "darwin", env: { XDG_CACHE_HOME: "/x" }, home: "/h" }, { prefix: "/p", modules: "/p/lib/node_modules", marker: "/h/Library/Caches/mutation/update-npm.pending" }],
    ["Windows", { file: windows, platform: "win32", env: { LOCALAPPDATA: "C:\\L" }, home: "C:\\h" }, { prefix: "C:\\p", modules: "C:\\p\\node_modules", marker: "C:\\L\\mutation\\update-npm.pending" }],
    ["Windows, no LOCALAPPDATA", { file: windows, platform: "win32", env: {}, home: "C:\\h" }, {}],
    ["a project's dependency", { file: "/w/app/node_modules/@mutationhq/cli/bin/mutation.mjs", platform: "linux", env: {}, home: "/h" }, {}],
  ];
  for (const [name, given, expected] of cases) {
    const found = layout(given);
    const seen = { prefix: found.prefix, modules: found.modules, marker: found.marker };
    const wanted = { prefix: expected.prefix, modules: expected.modules, marker: expected.marker };
    if (JSON.stringify(seen) !== JSON.stringify(wanted)) wrong.push(`${name}: ${JSON.stringify(seen)}`);
    if (found.marker && found.claimed !== `${found.marker}.claimed`) wrong.push(`${name}: claim ${found.claimed}`);
  }
  return wrong;
};

// A world of npm's global install at a temporary prefix, holding the launcher `text`, a fake binary and a
// fake npm, with the binary's cache folder; `run` starts the launcher there and ends with it.
const world = (text) => {
  const root = scratch();
  const windows = process.platform === "win32";
  const prefix = join(root, "prefix");
  const modules = windows ? join(prefix, "node_modules") : join(prefix, "lib", "node_modules");
  const launcher = join(modules, "@mutationhq", "cli", "bin", "mutation.mjs");
  mkdirSync(dirname(launcher), { recursive: true });
  writeFileSync(launcher, text);
  writeFileSync(join(dirname(launcher), "layout.mjs"), sources.layout);
  const bin = join(modules, "@mutationhq", `cli-${process.platform}-${process.arch}`, "bin");
  mkdirSync(bin, { recursive: true });
  copyFileSync(process.execPath, join(bin, windows ? "mutation.exe" : "mutation"), constants.COPYFILE_FICLONE);
  const npm = join(modules, "npm", "bin", "npm-cli.js");
  mkdirSync(dirname(npm), { recursive: true });
  writeFileSync(
    npm,
    `const { appendFileSync } = require("node:fs");
const log = (word) => appendFileSync(process.env.FAKE_LOG, word + " " + Date.now() + "\\n");
log("npm-start " + process.argv.slice(2).join(" ") + " cwd=" + process.cwd());
Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Number(process.env.FAKE_NPM_MS || 0));
log("npm-end");
`,
  );
  const fake = join(root, "fake.cjs");
  writeFileSync(
    fake,
    `const { basename } = require("node:path");
const { appendFileSync, existsSync } = require("node:fs");
if (basename(process.execPath).replace(/\\.exe$/i, "") === "mutation") {
  const log = (word) => appendFileSync(process.env.FAKE_LOG, word + " " + Date.now() + "\\n");
  if (process.env.MUTATION_UPDATE_CHILD === "gate") {
    log("gate-start " + process.pid);
    // Held, where the test holds gates, until it releases this one or all, within a bound.
    const held = process.env.FAKE_HOLD;
    const until = Date.now() + 20000;
    while (held && !existsSync(held + "-" + process.pid) && !existsSync(held + "-all") && Date.now() < until) {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
    }
    // The binary reads the claim; the marker too, so that a launcher that asks before it claims still
    // installs and its race shows.
    const claim = process.env.FAKE_CLAIMED;
    const answer = existsSync(claim) || existsSync(claim.replace(/\.claimed$/, "")) ? process.env.FAKE_GATE : "";
    log("gate-end " + process.pid);
    process.stdout.write(answer);
  } else {
    log("run");
  }
  process.exit(0);
}
`,
  );
  const home = join(root, "home");
  const env = { ...process.env, HOME: home, USERPROFILE: home, LOCALAPPDATA: join(root, "local"), NODE_OPTIONS: `--require ${JSON.stringify(fake)}` };
  delete env.XDG_CACHE_HOME;
  delete env.MUTATION_UPDATE_CHILD;
  const cache = windows ? env.LOCALAPPDATA : process.platform === "darwin" ? join(home, "Library", "Caches") : join(home, ".cache");
  const pending = join(cache, "mutation", "update-npm.pending");
  mkdirSync(dirname(pending), { recursive: true });
  const log = join(root, "log");
  writeFileSync(log, "");
  const run = (extra) =>
    new Promise((ended) => {
      const child = spawn(process.execPath, [launcher, "query"], {
        env: { ...env, FAKE_LOG: log, FAKE_CLAIMED: `${pending}.claimed`, ...extra },
        stdio: "ignore",
      });
      child.on("exit", ended);
    });
  const events = () =>
    readFileSync(log, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const words = line.split(" ");
        return { name: words[0], text: words.slice(1, -1).join(" "), at: Number(words.at(-1)) };
      });
  const hold = join(root, "release");
  const release = (which) => writeFileSync(`${hold}-${which}`, "");
  return { prefix, pending, run, events, hold, release };
};

// Waits for the events `found` gives, within `bound` ms: the events seen then, perhaps none.
const until = async (at, found, bound) => {
  const deadline = Date.now() + bound;
  while (found(at.events()).length === 0 && Date.now() < deadline) await new Promise((later) => setTimeout(later, 10));
  return found(at.events());
};

// An update the binary accepts: npm runs once at the prefix with the version, the claim is consumed, and
// the command runs after it.
const checkConsumed = async (text) => {
  const at = world(text);
  writeFileSync(at.pending, "{}");
  await at.run({ FAKE_GATE: "0.2.0" });
  const wrong = [];
  const npm = at.events().filter((event) => event.name === "npm-start");
  const words = `install --global --prefix ${at.prefix} --ignore-scripts --no-audit --no-fund @mutationhq/cli@0.2.0 cwd=${at.prefix}`;
  if (npm.length !== 1 || npm[0].text !== words) wrong.push(`npm: ${JSON.stringify(npm)}`);
  if (existsSync(at.pending) || existsSync(`${at.pending}.claimed`)) wrong.push("the marker or its claim is left");
  if (at.events().filter((event) => event.name === "run").length !== 1) wrong.push("the command did not run once");
  return wrong;
};

// An update the binary refuses for this command: the claim becomes the marker again, for a later command,
// and npm never runs.
const checkRefused = async (text) => {
  const at = world(text);
  const marker = JSON.stringify({ version: "0.2.0", prefix: at.prefix });
  writeFileSync(at.pending, marker);
  await at.run({ FAKE_GATE: "" });
  const wrong = [];
  if (!existsSync(at.pending)) wrong.push("the marker is not restored");
  else if (readFileSync(at.pending, "utf8") !== marker) wrong.push("the marker is restored with other contents");
  if (existsSync(`${at.pending}.claimed`)) wrong.push("the claim is left");
  if (at.events().some((event) => event.name === "npm-start")) wrong.push("npm ran");
  if (at.events().filter((event) => event.name === "run").length !== 1) wrong.push("the command did not run once");
  return wrong;
};

// Two launchers at once on one marker, the second started while the first's gate is held: npm runs once,
// and no binary of the package, a gate or a command, runs while npm does. Each step waits for the state it
// follows: the first gate held; the second's gate, which a launcher that waits for the claim never starts
// (bounded); npm started once the first gate is released; then every gate released.
const checkRace = async (text) => {
  const at = world(text);
  writeFileSync(at.pending, JSON.stringify({ version: "0.2.0", prefix: at.prefix }));
  const timing = { FAKE_GATE: "0.2.0", FAKE_NPM_MS: "300", FAKE_HOLD: at.hold };
  const first = at.run(timing);
  const [held] = await until(at, (events) => events.filter((event) => event.name === "gate-start"), 10_000);
  const second = at.run(timing);
  await until(at, (events) => events.filter((event) => event.name === "gate-start" && event.text !== held?.text), 2_000);
  at.release(held?.text);
  await until(at, (events) => events.filter((event) => event.name === "npm-start"), 10_000);
  at.release("all");
  await Promise.all([first, second]);
  const events = at.events();
  const wrong = [];
  const starts = events.filter((event) => event.name === "npm-start");
  if (starts.length !== 1) wrong.push(`npm ran ${starts.length} times`);
  const npm = { from: starts[0]?.at ?? 0, to: events.find((event) => event.name === "npm-end")?.at ?? 0 };
  const binary = events.filter((event) => ["gate-start", "gate-end", "run"].includes(event.name));
  const during = binary.filter((event) => event.at >= npm.from && event.at <= npm.to);
  const gates = events.filter((event) => event.name === "gate-start");
  const straddles = gates.some((start) => {
    const end = events.find((event) => event.name === "gate-end" && event.text === start.text);
    return end && start.at < npm.from && end.at > npm.from;
  });
  if (during.length > 0 || straddles) wrong.push(`the binary ran while npm did: ${JSON.stringify(events)}`);
  if (events.filter((event) => event.name === "run").length !== 2) wrong.push("the commands did not both run");
  return wrong;
};

test("each system's layout: npm's prefix and the binary's cache folder", async () => {
  assert.deepEqual(checkLayout(await loaded(sources.layout)), []);
});

test("planted: a Unix prefix taken as the folder above node_modules, and a relative XDG_CACHE_HOME taken", async () => {
  const prefix = planted(sources.layout, [["const prefix = windows ? p.dirname(modules) : p.dirname(p.dirname(modules));", "const prefix = p.dirname(modules);"]]);
  assert.notDeepEqual(checkLayout(await loaded(prefix)), []);
  const relative = planted(sources.layout, [[": xdg && p.isAbsolute(xdg)", ": xdg"]]);
  assert.notDeepEqual(checkLayout(await loaded(relative)), []);
});

test("an update the binary accepts is installed once and its claim consumed", async () => {
  assert.deepEqual(await checkConsumed(sources.launcher), []);
});

test("planted: a claim left after npm", async () => {
  const left = planted(sources.launcher, [["  } finally {\n    rmSync(claimed, { force: true });\n  }", "  } finally {\n  }"]]);
  assert.notDeepEqual(await checkConsumed(left), []);
});

test("a claim the binary refuses becomes the marker again", async () => {
  assert.deepEqual(await checkRefused(sources.launcher), []);
});

test("planted: a refused claim restored empty", async () => {
  const emptied = planted(sources.launcher, [
    ['import { existsSync, renameSync, rmSync, statSync, utimesSync } from "node:fs";', 'import { existsSync, renameSync, rmSync, statSync, utimesSync, writeFileSync } from "node:fs";'],
    ["      else renameSync(claimed, marker);", "      else { renameSync(claimed, marker); writeFileSync(marker, \"{}\"); }"],
  ]);
  assert.match((await checkRefused(emptied)).join("\n"), /other contents/);
});

test("planted: a refused claim dropped", async () => {
  const dropped = planted(sources.launcher, [["      else renameSync(claimed, marker);", "      else rmSync(claimed, { force: true });"]]);
  assert.notDeepEqual(await checkRefused(dropped), []);
});

test("two launchers at once: npm runs once, and no binary runs while it does", async () => {
  assert.deepEqual(await checkRace(sources.launcher), []);
});

test("planted: the gate asked before the marker is claimed", async () => {
  const claim = "  try {\n    renameSync(marker, claimed);\n    utimesSync(claimed, new Date(), new Date());\n  } catch {\n    return waitForClaim();\n  }\n";
  const asked = '  const version = (gate.stdout ?? "").trim();\n';
  const late = planted(sources.launcher, [[`${claim}  const env`, "  const env"], [asked, `${asked}${claim}`]]);
  assert.match((await checkRace(late)).join("\n"), /the binary ran while npm did/);
});
