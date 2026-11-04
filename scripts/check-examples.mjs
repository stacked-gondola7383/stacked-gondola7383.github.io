// Runs every playground example through the WebAssembly build and checks its status.
//   node scripts/check-examples.mjs   (after static/playground/e7wasm.js has been built)
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";

const src = readFileSync(resolve("src/components/playgroundExamples.js"), "utf8");
const examples = JSON.parse(src.slice(src.indexOf("export default ") + 15, src.lastIndexOf(";")));
const { default: createE7 } = await import(pathToFileURL(resolve("static/playground/e7wasm.js")).href);
const m = await createE7();
const run = m.cwrap("e7w_run", "number", ["string", "number", "number", "number"]);
const str = (fn) => m.UTF8ToString(m.ccall(fn, "number", [], []));

let failed = 0;
for (const ex of examples) {
  const status = run(ex.code, 5e8, 128 * 1024 * 1024, 1);
  const ok = status === ex.expect;
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${ex.id}: status ${status} (expected ${ex.expect})`);
  if (!ok) console.log(str("e7w_output") + str("e7w_error"));
}
if (failed) process.exit(1);
console.log(`all ${examples.length} playground examples behave as expected (e7 ${str("e7w_version")})`);
