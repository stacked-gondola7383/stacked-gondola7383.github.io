import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { keymap } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { useColorMode } from "@docusaurus/theme-common";
import useBaseUrl from "@docusaurus/useBaseUrl";
import examples from "./playgroundExamples";
import styles from "./Playground.module.css";

const BUDGET = 5e8;              // instructions per run
const MEMORY = 128 * 1024 * 1024; // heap limit
const STORAGE_KEY = "e7-playground-source-v2"; // bump when the default example changes

const STATUS = {
  0: "ok", 2: "runtime error", 3: "instruction budget exhausted", 4: "memory limit exceeded",
  5: "call depth limit exceeded", 6: "load error", 7: "verification failed", 11: "compile error",
};

// UTF-8 safe base64url, used for share links (#code=...)
function encodeShare(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decodeShare(s) {
  try {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  } catch {
    return null;
  }
}

function initialSource() {
  if (typeof window === "undefined") return examples[0].code;
  const m = window.location.hash.match(/^#code=(.+)$/);
  if (m) {
    const shared = decodeShare(m[1]);
    if (shared !== null) return shared;
  }
  const ex = new URLSearchParams(window.location.search).get("example");
  const found = examples.find((e) => e.id === ex);
  if (found) return found.code;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
  } catch {}
  return examples[0].code;
}

export default function Playground() {
  const { colorMode } = useColorMode();
  const workerUrl = useBaseUrl("/playground/worker.js");
  const [source, setSource] = useState(initialSource);
  const [phase, setPhase] = useState("loading"); // loading | ready | running | fatal
  const [version, setVersion] = useState("");
  const [tab, setTab] = useState("output");
  const [run, setRun] = useState(null);       // last run result
  const [disasm, setDisasm] = useState("");
  const [copied, setCopied] = useState(false);
  const workerRef = useRef(null);
  const seq = useRef(0);
  const sourceRef = useRef(source);
  sourceRef.current = source;

  const startWorker = useCallback(() => {
    workerRef.current?.terminate();
    const w = new Worker(workerUrl, { type: "module" });
    w.onmessage = ({ data }) => {
      if (data.type === "ready") { setVersion(data.version); setPhase("ready"); }
      else if (data.type === "fatal") { setPhase("fatal"); setRun({ status: -1, error: data.error, output: "", result: "" }); }
      else if (data.id !== seq.current) return; // stale
      else if (data.type === "result") { setRun(data); setPhase("ready"); }
      else if (data.type === "disasm") { setDisasm(data.text); setPhase("ready"); }
    };
    w.onerror = (e) => {
      setPhase("fatal");
      setRun({ status: -1, error: "Could not start the WebAssembly runtime: " + (e.message || "unknown error"), output: "", result: "" });
    };
    workerRef.current = w;
  }, [workerUrl]);

  useEffect(() => {
    startWorker();
    return () => workerRef.current?.terminate();
  }, [startWorker]);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, source); } catch {}
  }, [source]);

  const execute = useCallback((which) => {
    if (!workerRef.current) return;
    const id = ++seq.current;
    setPhase("running");
    const op = which === "bytecode" ? "disasm" : "run";
    workerRef.current.postMessage({ op, id, source: sourceRef.current, budget: BUDGET, memory: MEMORY, seed: 1 });
  }, []);

  const onRun = useCallback(() => {
    if (tab === "bytecode") execute("bytecode");
    else execute("run");
  }, [tab, execute]);

  const stop = () => {
    seq.current++;
    setPhase("loading");
    setRun({ status: -2, error: "Stopped.", output: "", result: "" });
    startWorker();
  };

  const showTab = (t) => {
    setTab(t);
    if (phase === "ready") execute(t === "bytecode" ? "bytecode" : "run");
  };

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}#code=${encodeShare(source)}`;
    window.history.replaceState(null, "", url);
    try { await navigator.clipboard.writeText(url); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const pickExample = (e) => {
    const ex = examples.find((x) => x.id === e.target.value);
    if (!ex) return;
    setSource(ex.code);
    setRun(null);
    setDisasm("");
    window.history.replaceState(null, "", `${window.location.pathname}?example=${ex.id}`);
  };

  const extensions = useMemo(() => [
    javascript({ typescript: true }),
    keymap.of([{ key: "Mod-Enter", preventDefault: true, run: () => { document.getElementById("e7-run")?.click(); return true; } }]),
  ], []);

  const ok = run && run.status === 0;
  const statusText = phase === "loading" ? "Loading the WebAssembly runtime…"
    : phase === "running" ? "Running…"
    : phase === "fatal" ? "Runtime unavailable"
    : run == null ? `Ready · e7 ${version}`
    : run.status === -2 ? "Stopped"
    : `${STATUS[run.status] || `status ${run.status}`} · ${run.ms.toFixed(1)} ms${run.size ? ` · ${run.size.toLocaleString()} bytes of bytecode` : ""}`;

  return (
    <div className={styles.shell}>
      <div className={styles.toolbar}>
        <button id="e7-run" className={styles.run} onClick={onRun} disabled={phase !== "ready"} title="Run (Ctrl/Cmd + Enter)">
          ▶ Run
        </button>
        {phase === "running" && <button className={styles.btn} onClick={stop}>■ Stop</button>}
        <select className={styles.select} onChange={pickExample} value="" aria-label="Examples">
          <option value="" disabled>Examples…</option>
          {examples.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        <button className={styles.btn} onClick={share}>{copied ? "Link copied ✓" : "Share"}</button>
        <span className={styles.spacer} />
        <span className={`${styles.status} ${run && !ok && run.status !== -2 && phase === "ready" ? styles.bad : ""} ${ok && phase === "ready" ? styles.good : ""}`}>
          {statusText}
        </span>
      </div>
      <div className={styles.panes}>
        <div className={styles.editor}>
          <CodeMirror
            value={source}
            height="100%"
            theme={colorMode === "dark" ? "dark" : "light"}
            extensions={extensions}
            onChange={setSource}
            basicSetup={{ tabSize: 2 }}
            aria-label="E7 source code"
          />
        </div>
        <div className={styles.output}>
          <div className={styles.tabs} role="tablist">
            <button role="tab" aria-selected={tab === "output"} className={tab === "output" ? styles.tabOn : styles.tab} onClick={() => showTab("output")}>Output</button>
            <button role="tab" aria-selected={tab === "bytecode"} className={tab === "bytecode" ? styles.tabOn : styles.tab} onClick={() => showTab("bytecode")}>Bytecode</button>
          </div>
          <pre className={styles.console}>
            {tab === "bytecode" ? (disasm || "Press Run to compile and show the bytecode.") : run == null ? (
              <span className={styles.hint}>{phase === "loading" ? "Loading…" : "Press Run (Ctrl/Cmd + Enter) to compile and run the script.\nAn exported main() is called after the top-level code."}</span>
            ) : (
              <>
                {run.output}
                {run.result !== "" && <span className={styles.result}>{"main() → " + run.result + "\n"}</span>}
                {run.error && <span className={styles.err}>{run.error}</span>}
                {run.status === 0 && !run.output && run.result === "" && <span className={styles.hint}>(no output)</span>}
              </>
            )}
          </pre>
        </div>
      </div>
      <div className={styles.footnote}>
        The real E7 compiler and e7vm, compiled to WebAssembly and running in your browser. Nothing is sent to a server.
        Limits: {BUDGET / 1e6}M instructions, {MEMORY >> 20} MiB heap.
      </div>
    </div>
  );
}
