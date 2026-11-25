#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Mutation.sh. See the file LICENSE in this package.
//
// Runs the `mutation` binary of the platform package that npm installed beside this one (an optional
// dependency), under the name it was invoked by (`mutation` or `mut`), with this process's arguments and
// stdio, and ends as the binary ended: its exit code, or
// the same signal raised again on this process, so a shell sees 130 for an interrupt, never 0.
//
// It first installs an update that the binary left for it: where npm installed it globally, the binary's
// update writes the version and its prefix to `update-npm.pending` in its cache folder (the system's folder
// of caches, `mutation` in it), and npm runs here, with no binary of the package running, since Windows
// cannot replace a folder whose program runs. The binary still decides: asked with
// MUTATION_UPDATE_CHILD=gate, it prints the version only where its own settings, CI and installation allow
// it now. The launcher claims the marker first by renaming it to `.claimed`, which another launcher waits
// for, asks the binary, which reads the claim, and runs the npm that came with Node, never a shell or an
// `npm` of the current folder; a claim the binary refuses becomes the marker again.

import { spawn, spawnSync } from "node:child_process";
import { existsSync, renameSync, rmSync, statSync, utimesSync } from "node:fs";
import { createRequire } from "node:module";
import { constants, homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { invoked, layout } from "./layout.mjs";

const supported = ["darwin-arm64", "linux-x64", "linux-arm64", "win32-x64"];
const platform = `${process.platform}-${process.arch}`;
const windows = process.platform === "win32";
const binary = `@mutationhq/cli-${platform}/bin/mutation${windows ? ".exe" : ""}`;

const pause = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

const file = fileURLToPath(import.meta.url);
const name = invoked(process.argv[1]);
const { prefix, modules, marker, claimed } = layout({ file, platform: process.platform, env: process.env, home: homedir() });
const updating = Boolean(marker);

// Waits while another launcher installs: a claim is fresh for the ten minutes npm is given at most, from
// the moment it was taken.
const waitForClaim = () => {
  const fresh = () => {
    try {
      return Date.now() - statSync(claimed).mtimeMs < 600_000;
    } catch {
      return false;
    }
  };
  while (updating && fresh()) pause(500);
};

waitForClaim();

let path;
try {
  path = createRequire(import.meta.url).resolve(binary);
} catch {
  const known = supported.includes(platform);
  process.stderr.write(
    known
      ? `${name}: the package @mutationhq/cli-${platform} is not installed.\n` +
          (process.platform === "linux"
            ? "  note: Linux builds need glibc 2.28 or newer; musl systems such as Alpine are not supported\n"
            : "") +
          "  fix: install @mutationhq/cli again with optional dependencies included (npm install --include=optional)\n"
      : `${name}: no build for ${platform}.\n` +
          `  supported: ${supported.join(", ")} (Linux with glibc 2.28 or newer)\n`,
  );
  process.exit(1);
}

const update = () => {
  if (!updating) return;
  // The marker is renamed to the claim in one step: where it is gone, a claim taken meanwhile is visible.
  if (!existsSync(marker)) return waitForClaim();
  // Claimed first, so no other launcher starts the binary, its gate included, while this one asks and
  // installs; the gate reads the claim.
  try {
    renameSync(marker, claimed);
    utimesSync(claimed, new Date(), new Date());
  } catch {
    return waitForClaim();
  }
  const env = { ...process.env, MUTATION_UPDATE_CHILD: "gate" };
  const gate = spawnSync(path, process.argv.slice(2), { env, encoding: "utf8", timeout: 30_000, windowsHide: true });
  const version = (gate.stdout ?? "").trim();
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    // Not for this command: the marker back for a later one, unless the binary left a newer one meanwhile.
    try {
      if (existsSync(marker)) rmSync(claimed, { force: true });
      else renameSync(claimed, marker);
    } catch {
      rmSync(claimed, { force: true });
    }
    return;
  }
  const bundled = windows
    ? join(dirname(process.execPath), "node_modules", "npm")
    : join(dirname(process.execPath), "..", "lib", "node_modules", "npm");
  const npm = [join(modules, "npm"), bundled]
    .map((folder) => join(folder, "bin", "npm-cli.js"))
    .find(existsSync);
  const words = ["install", "--global", "--prefix", prefix, "--ignore-scripts", "--no-audit", "--no-fund"];
  const how = `npm install --global --prefix "${prefix}" @mutationhq/cli@${version}`;
  try {
    if (process.stderr.isTTY) process.stderr.write(`${name}: installing ${version}\n`);
    const result = npm
      ? spawnSync(process.execPath, [npm, ...words, `@mutationhq/cli@${version}`], {
          cwd: prefix,
          stdio: "ignore",
          timeout: 600_000,
          windowsHide: true,
        })
      : { status: null };
    if (result.status !== 0) {
      process.stderr.write(`${name}: the update to ${version} did not complete; to install it: ${how}\n`);
    }
  } finally {
    rmSync(claimed, { force: true });
  }
};

update();

const child = spawn(path, process.argv.slice(2), { stdio: "inherit", argv0: name });

const forward = (signal) => () => child.kill(signal);
const handlers = { SIGINT: forward("SIGINT"), SIGTERM: forward("SIGTERM") };
for (const [signal, handler] of Object.entries(handlers)) process.on(signal, handler);

child.on("error", (error) => {
  process.stderr.write(`${name}: could not run ${path}: ${error.message}\n`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  for (const [name, handler] of Object.entries(handlers)) process.off(name, handler);
  if (signal) {
    process.kill(process.pid, signal);
    // Where raising it did not end this process (Windows), the shell's convention for a signal.
    process.exit(128 + (constants.signals[signal] ?? 0));
  }
  process.exit(code ?? 1);
});
