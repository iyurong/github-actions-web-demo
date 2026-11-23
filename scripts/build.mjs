import { mkdir, readdir, readFile, rm, writeFile, copyFile } from "node:fs/promises";
import { join } from "node:path";

const sourceDir = "src";
const outputDir = "dist";

async function copyDirectory(source, target) {
  await mkdir(target, { recursive: true });
  const entries = await readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const from = join(source, entry.name);
    const to = join(target, entry.name);
    if (entry.isDirectory()) {
      await copyDirectory(from, to);
    } else {
      await copyFile(from, to);
    }
  }
}

await rm(outputDir, { recursive: true, force: true });
await copyDirectory(sourceDir, outputDir);

const buildInfo = {
  builtAt: new Date().toISOString(),
  commit: process.env.GITHUB_SHA || "local",
  ref: process.env.GITHUB_REF_NAME || "local",
  runId: process.env.GITHUB_RUN_ID || "local",
  repository: process.env.GITHUB_REPOSITORY || "local"
};

await writeFile(
  join(outputDir, "build-info.json"),
  JSON.stringify(buildInfo, null, 2),
  "utf8"
);

console.log("Build complete:", JSON.stringify(buildInfo));