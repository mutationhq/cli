// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Mutation.sh. See the file LICENSE in this package.
//
// Where the launcher at `file` finds npm's global folder and the binary's update marker on `platform`, from
// `env` and the user's `home`, and the name it was invoked by: pure functions, so that each system's layout
// is a test on every system.

import path from "node:path";

// npm's global folder: <prefix>\node_modules\@mutationhq\cli\bin\mutation.mjs on Windows,
// <prefix>/lib/node_modules/@mutationhq/cli/bin/mutation.mjs elsewhere (Node runs the launcher by its real
// path). The binary's cache folder: %LOCALAPPDATA% on Windows, which the binary reads there too; elsewhere
// the `dirs` crate's rule, ~/Library/Caches on macOS and $XDG_CACHE_HOME where absolute, else ~/.cache.
// None where the launcher is not in npm's global folder, or the folder is not known.
export const layout = ({ file, platform, env, home }) => {
  const windows = platform === "win32";
  const p = windows ? path.win32 : path.posix;
  const modules = p.resolve(p.dirname(file), "..", "..", "..");
  const global = p.basename(modules) === "node_modules" && (windows || p.basename(p.dirname(modules)) === "lib");
  if (!global) return {};
  const prefix = windows ? p.dirname(modules) : p.dirname(p.dirname(modules));
  const xdg = env.XDG_CACHE_HOME;
  const cache = windows
    ? env.LOCALAPPDATA || undefined
    : platform === "darwin"
      ? p.join(home, "Library", "Caches")
      : xdg && p.isAbsolute(xdg)
        ? xdg
        : p.join(home, ".cache");
  if (!cache) return {};
  const marker = p.join(cache, "mutation", "update-npm.pending");
  return { prefix, modules, marker, claimed: `${marker}.claimed` };
};

// The name the launcher was invoked by, from the path Node was given (`process.argv[1]`): `mut` where its
// stem is `mut` (npm links `<prefix>/bin/mut` to this file), else `mutation`. The binary is started under
// that name, so its help and errors show it. npm's Windows shims pass this file's own path, so there the
// name is `mutation`.
export const invoked = (script) => {
  const name = path.win32.basename(path.posix.basename(script ?? ""));
  return /^mut(\.(c?js|mjs|cmd|ps1|exe))?$/i.test(name) ? "mut" : "mutation";
};
