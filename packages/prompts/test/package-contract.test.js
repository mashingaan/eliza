/**
 * Verifies the published source-only package contract through Node-style
 * package self-resolution without replacing the prompts or TypeScript module.
 */
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  readFileSync(join(packageRoot, "package.json"), "utf8"),
);

describe("source-only package contract", () => {
  it("resolves and imports the supported package root from maintained source", async () => {
    assert.strictEqual(
      fileURLToPath(import.meta.resolve("@elizaos/prompts")),
      join(packageRoot, "src", "index.ts"),
    );
    const packageExports = await import("@elizaos/prompts");
    assert.strictEqual(typeof packageExports.replyTemplate, "string");
    assert.strictEqual(
      packageExports.REPLY_TEMPLATE,
      packageExports.replyTemplate,
    );
  });

  it("publishes only real root export targets and source-owned files", () => {
    assert.deepStrictEqual(manifest.exports, {
      ".": {
        types: "./src/index.ts",
        import: "./src/index.ts",
      },
    });
    assert.deepStrictEqual(manifest.files, ["src/", "scripts/"]);
  });
});
