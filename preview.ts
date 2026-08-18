#!/usr/bin/env bun

const proc = Bun.spawn(["bun", "run", "dev"], {
  cwd: `${import.meta.dir}/web`,
  stdout: "inherit",
  stderr: "inherit",
  stdin: "inherit",
});

process.exit(await proc.exited);
