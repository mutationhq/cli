#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Mutation.sh. See the file LICENSE in this package.
//
// Runs the `mutation` binary of the platform package that npm installed beside this one (an optional
// dependency), with this process's arguments and stdio, and ends as the binary ended: its exit code, or
// the same signal raised again on this process, so a shell sees 130 for an interrupt, never 0.
//
// On Windows it first installs an update that the binary left for it: where npm installed it globally, the
// binary writes the version and its prefix to `%LOCALAPPDATA%\mutation\update-npm.pending`, since Windows
// cannot replace a folder whose program runs. The binary still decides: asked with
// MUTATION_UPDATE_CHILD=gate, it prints the version only where its own settings, CI and installation allow
// it now. The launcher then claims the marker by renaming it to `.claimed`, which another launcher waits
// for, and runs the npm that came with Node, never a shell or an `npm` of the current folder.

import { spawn, spawnSync } from "node:child_process";
import { existsSync, renameSync, rmSync, statSync, utimesSync } from "node:fs";
import { createRequire } from "node:module";
import { constants } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const supported = ["darwin-arm64", "linux-x64", "linux-arm64", "win32-x64"];
const platform = `${process.platform}-${process.arch}`;
const binary = `@mutationhq/cli-${platform}/bin/mutation${process.platform === "win32" ? ".exe" : ""}`;

const pause = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

// <prefix>\node_modules\@mutationhq\cli\bin\mutation.mjs: npm's global folder on Windows.
const modules = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const prefix = dirname(modules);
const updating = process.platform === "win32" && basename(modules) === "node_modules" && process.env.LOCALAPPDATA;
const marker = updating && join(process.env.LOCALAPPDATA, "mutation", "update-npm.pending");
const claimed = updating && `${marker}.claimed`;

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
      ? `mutation: the package @mutationhq/cli-${platform} is not installed.\n` +
          (process.platform === "linux"
            ? "  note: Linux builds need glibc 2.28 or newer; musl systems such as Alpine are not supported\n"
            : "") +
          "  fix: install @mutationhq/cli again with optional dependencies included (npm install --include=optional)\n"
      : `mutation: no build for ${platform}.\n` +
          `  supported: ${supported.join(", ")} (Linux with glibc 2.28 or newer)\n`,
  );
  process.exit(1);
}

const update = () => {
  if (!updating || !existsSync(marker)) return;
  const env = { ...process.env, MUTATION_UPDATE_CHILD: "gate" };
  const gate = spawnSync(path, process.argv.slice(2), { env, encoding: "utf8", timeout: 30_000, windowsHide: true });
  const version = (gate.stdout ?? "").trim();
  // No answer: not for now, or another launcher took the marker meanwhile and installs.
  if (!/^\d+\.\d+\.\d+$/.test(version)) return waitForClaim();
  try {
    renameSync(marker, claimed);
    utimesSync(claimed, new Date(), new Date());
  } catch {
    return waitForClaim();
  }
  const npm = [join(prefix, "node_modules", "npm"), join(dirname(process.execPath), "node_modules", "npm")]
    .map((folder) => join(folder, "bin", "npm-cli.js"))
    .find(existsSync);
  const words = ["install", "--global", "--prefix", prefix, "--ignore-scripts", "--no-audit", "--no-fund"];
  const how = `npm install --global --prefix "${prefix}" @mutationhq/cli@${version}`;
  try {
    if (process.stderr.isTTY) process.stderr.write(`mutation: installing ${version}\n`);
    const result = npm
      ? spawnSync(process.execPath, [npm, ...words, `@mutationhq/cli@${version}`], {
          cwd: prefix,
          stdio: "ignore",
          timeout: 600_000,
          windowsHide: true,
        })
      : { status: null };
    if (result.status !== 0) {
      process.stderr.write(`mutation: the update to ${version} did not complete; to install it: ${how}\n`);
    }
  } finally {
    rmSync(claimed, { force: true });
  }
};

update();

const child = spawn(path, process.argv.slice(2), { stdio: "inherit" });

const forward = (signal) => () => child.kill(signal);
const handlers = { SIGINT: forward("SIGINT"), SIGTERM: forward("SIGTERM") };
for (const [signal, handler] of Object.entries(handlers)) process.on(signal, handler);

child.on("error", (error) => {
  process.stderr.write(`mutation: could not run ${path}: ${error.message}\n`);
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
