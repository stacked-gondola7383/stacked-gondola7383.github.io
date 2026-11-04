// Runs the E7 compiler + VM (WebAssembly) off the main thread, so a long-running script never
// freezes the page; the page can terminate this worker at any time.
import createE7 from "./e7wasm.js";

let api = null;
const ready = createE7()
  .then((m) => {
    api = {
      run: m.cwrap("e7w_run", "number", ["string", "number", "number", "number"]),
      disasm: m.cwrap("e7w_disasm", "string", ["string"]),
      str: (fn) => m.UTF8ToString(m.ccall(fn, "number", [], [])),
      num: (fn) => m.ccall(fn, "number", [], []),
    };
    postMessage({ type: "ready", version: api.str("e7w_version") });
  })
  .catch((err) => postMessage({ type: "fatal", error: String(err && err.message ? err.message : err) }));

onmessage = async ({ data }) => {
  await ready;
  if (!api) return;
  if (data.op === "run") {
    const t0 = performance.now();
    const status = api.run(data.source, data.budget, data.memory, data.seed);
    const ms = performance.now() - t0;
    postMessage({
      type: "result", id: data.id, status, ms,
      output: api.str("e7w_output"), result: api.str("e7w_result"), error: api.str("e7w_error"),
      size: api.num("e7w_bytecode_size"),
    });
  } else if (data.op === "disasm") {
    postMessage({ type: "disasm", id: data.id, text: api.disasm(data.source) });
  }
};
