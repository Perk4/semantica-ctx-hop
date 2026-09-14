import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

test("package entry loads from node_modules without type stripping", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "semantica-ctx-hop-consumer-"));
  try {
    const packageDir = path.join(dir, "node_modules", "semantica-ctx-hop");
    await mkdir(path.dirname(packageDir), { recursive: true });
    await symlink(repoRoot, packageDir);
    const consumerPath = path.join(dir, "consumer.mjs");
    await writeFile(
      consumerPath,
      `import { ingestFact, hopNeighbors } from "semantica-ctx-hop";
const store = [];
ingestFact(store, { s: "Alice", r: "knows", o: "Bob" });
const edges = hopNeighbors(store, "Alice");
if (edges.length !== 1 || edges[0].o !== "Bob") {
  throw new Error("unexpected edges");
}
`,
    );
    await execFileAsync(process.execPath, [consumerPath], { cwd: dir });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
