#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Mutation.sh. See the file LICENSE in this package.
//
// Runs the `mutation` binary of the platform package that npm installed beside this one (an optional
// dependency), with this process's arguments and stdio, and ends as the binary ended: its exit code, or
// the same signal raised again on this process, so a shell sees 130 for an interrupt, never 0.

import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { constants } from "node:os";

const supported = ["darwin-arm64", "linux-x64", "linux-arm64", "win32-x64"];
const platform = `${process.platform}-${process.arch}`;
const binary = `@mutationhq/cli-${platform}/bin/mutation${process.platform === "win32" ? ".exe" : ""}`;

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
