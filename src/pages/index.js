import React from "react";
import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import CodeBlock from "@theme/CodeBlock";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./index.module.css";

const heroCode = `import { hmac } from "e7:crypto";
import { hexEncode } from "e7:encoding";
import type { KeyHandle } from "e7:crypto";

// The key lives in the Keychain / Keystore.
// The script can use it, but never see it.
export function sign(params: Map<string, string>,
                     key: KeyHandle): string {
  const enc = (s: string) => encodeURIComponent(s);
  const query = [...params.keys()].sort()
    .map(k => \`\${enc(k)}=\${enc(params.get(k)!)}\`)
    .join("&");
  const data = new TextEncoder().encode(query);
  return hexEncode(hmac("sha256", key, data));
}`;

const features = [
  { icon: "⚡", bg: "rgba(16,185,129,.14)", title: "Ship without a release",
    text: <>Compile on your build server, deliver <code>.e7b</code> bytecode over your CDN or API, and the app verifies and runs it.</> },
  { icon: "🛡️", bg: "rgba(14,165,233,.14)", title: "Safe by construction",
    text: <>A bytecode verifier keeps memory safe even for tampered input. Budgets bound instructions, memory and call depth.</> },
  { icon: "🔑", bg: "rgba(245,158,11,.16)", title: "Secrets stay in the host",
    text: <>A <code>KeyHandle</code> lets a script sign with a key from the Keychain, Keystore or DPAPI without ever reading it.</> },
  { icon: "🧩", bg: "rgba(139,92,246,.15)", title: "TypeScript you already know",
    text: <>Every E7 program is valid TypeScript. Use VS Code and <code>tsc --strict</code>; results match Node.js.</> },
  { icon: "🔐", bg: "rgba(236,72,153,.13)", title: "Batteries for crypto",
    text: <>SHA-2/3, HMAC, HKDF, PBKDF2, AES-GCM, ChaCha20-Poly1305, Ed25519, X25519, ECDSA and RSA, as native code.</> },
  { icon: "📦", bg: "rgba(34,197,94,.14)", title: "Small and fast",
    text: <>About 470 KB for the runtime, 920 KB with the on-device compiler. Faster than V8's interpreter on most workloads.</> },
];

const perf = [
  ["fib(30), recursive calls", 58, 70, 10, true],
  ["30M-iteration loop", 369, 518, 45, true],
  ["Sieve of Eratosthenes, 5M", 298, 465, 91, true],
  ["4M allocations + 2M method calls", 395, 739, 38, true],
  ["SHA-256 in pure script (u32), 1 MiB", 168, 1159, 41, true],
  ["String concat / split / Map", 384, 293, 243, false],
];

function Hero() {
  return (
    <header className={styles.hero}>
      <div className={`container ${styles.heroInner}`}>
        <div>
          <span className={styles.eyebrow}>● Strict TypeScript subset · Verified bytecode · No JIT</span>
          <h1 className={styles.title}>
            The TypeScript you know,<br />
            <span className={styles.grad}>running safely inside your app.</span>
          </h1>
          <p className={styles.lead}>
            E7 lets you ship algorithms, such as request signing and verification, as small scripts delivered from your
            server. e7vm verifies the bytecode and runs it in a sandbox on Android, iOS, Windows, macOS and Linux.
          </p>
          <div className={styles.cta}>
            <Link className={`${styles.btn} ${styles.primary}`} to="/docs/getting-started">Get started →</Link>
            <Link className={`${styles.btn} ${styles.ghost}`} to="/playground">Try it in the browser</Link>
            <Link className={`${styles.btn} ${styles.ghost}`} href="https://github.com/e7lang/e7">GitHub</Link>
          </div>
          <div className={styles.platforms}>
            {["Android", "iOS", "Windows", "macOS", "Linux", "C · Kotlin · Swift · C#"].map((p) => <span key={p}>{p}</span>)}
          </div>
        </div>
        <div className={styles.codeCard}>
          <div className={styles.codeBar}>
            <i className={styles.dot} style={{ background: "#f87171" }} />
            <i className={styles.dot} style={{ background: "#fbbf24" }} />
            <i className={styles.dot} style={{ background: "#34d399" }} />
            <span className={styles.file}>sign.ts</span>
          </div>
          <CodeBlock language="ts">{heroCode}</CodeBlock>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const arch = useBaseUrl("/img/architecture.png");
  return (
    <Layout
      title="The TypeScript you know, running safely inside your app"
      description="E7 is a strict TypeScript subset and e7vm a small, verified bytecode VM for running server-delivered scripts in Android, iOS, Windows, macOS and Linux apps.">
      <Hero />
      <main>
        <div className="container">
          <div className={styles.stats}>
            <div className={styles.stat}><b>~470 KB</b><span>runtime library, crypto included</span></div>
            <div className={styles.stat}><b>0 JIT</b><span>pure interpreter, App Store safe</span></div>
            <div className={styles.stat}><b>Portable</b><span>one .e7b runs on every platform</span></div>
            <div className={styles.stat}><b>Fast</b><span>beats V8's interpreter, native crypto</span></div>
          </div>
        </div>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.kicker}>Why E7</div>
            <h2 className={styles.h2}>Update algorithms without shipping a new app</h2>
            <p className={styles.sub}>
              Request signing, webhook checks and license validation change faster than app releases. E7 moves that
              logic into small scripts you compile on your server.
            </p>
            <div className={styles.grid3}>
              {features.map((f) => (
                <div className={styles.card} key={f.title}>
                  <div className={styles.icon} style={{ background: f.bg }}>{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.alt}`}>
          <div className="container">
            <div className={styles.kicker}>How it works</div>
            <h2 className={styles.h2}>From TypeScript to a verified, sandboxed call</h2>
            <p className={styles.sub}>Your server compiles. Your app verifies the bytecode before anything runs.</p>
            <div className={styles.steps}>
              <div className={styles.step}><h3>Write</h3><p>A script in the E7 subset of TypeScript, fully type-checked in your editor.</p></div>
              <div className={styles.step}><h3>Compile</h3><p><code>e7c</code> compiles to compact, portable bytecode, optionally signed with your Ed25519 key.</p></div>
              <div className={styles.step}><h3>Verify &amp; run</h3><p>e7vm verifies the bytecode, links your host functions and runs it under a budget.</p></div>
            </div>
            <div className={styles.arch}>
              <img src={arch} alt="E7 architecture: the build server compiles; the app verifies, links natives and runs the interpreter" loading="lazy" />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={`container ${styles.split}`}>
            <div>
              <div className={styles.kicker}>Security</div>
              <h2 className={styles.h2}>Built to run code that came over the network</h2>
              <p className={styles.sub}>
                Every layer assumes the bytecode may be hostile. Four independent security reviews, differential testing
                against Node.js and OpenSSL, sanitizers and fuzzing; every finding fixed with a regression test.
              </p>
              <Link to="/docs/reference/PRODUCTION">Read the evidence →</Link>
            </div>
            <ul className={styles.checks}>
              <li><div><b>Bytecode verifier</b><span>Registers, types, indices, jump targets and call metadata are validated before anything runs.</span></div></li>
              <li><div><b>Budgets and limits</b><span>Instruction budget (heavy native calls included), memory limit and call-depth limit.</span></div></li>
              <li><div><b>Explicit capabilities</b><span>Scripts can call only the host functions you register: no files, network or system access.</span></div></li>
              <li><div><b>Keys stay in the host</b><span><code>KeyHandle</code> resolves keys natively; scripts can use keys they can never read.</span></div></li>
              <li><div><b>Optional Ed25519 signatures</b><span>Require modules signed by your key when they travel over an untrusted channel.</span></div></li>
            </ul>
          </div>
        </section>

        <section className={`${styles.section} ${styles.alt}`}>
          <div className="container">
            <div className={styles.kicker}>Performance</div>
            <h2 className={styles.h2}>Interpreter speed where it matters</h2>
            <p className={styles.sub}>
              On iOS every engine must interpret. Against V8 in the same mode (<code>--jitless</code>), e7vm is faster on
              most workloads, and standard crypto always runs as native code.
            </p>
            <table className={styles.table}>
              <thead>
                <tr><th>Benchmark (x86-64, ms)</th><th className="n">e7vm</th><th className="n">V8 --jitless</th><th className="n">V8 JIT</th></tr>
              </thead>
              <tbody>
                {perf.map(([name, e7, jl, jit, win]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td className={`n ${win ? styles.win : ""}`}>{e7}</td>
                    <td className="n">{jl}</td>
                    <td className="n">{jit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="container">
          <div className={styles.final}>
            <div className={styles.finalBox}>
              <h2 className={styles.h2}>Write your first E7 script</h2>
              <p>Run it in the browser right now, or install the toolchain in a minute.</p>
              <div className={styles.cta}>
                <Link className={`${styles.btn} ${styles.primary}`} to="/playground">Open the playground</Link>
                <Link className={`${styles.btn} ${styles.ghost}`} to="/docs/getting-started">Getting started</Link>
                <Link className={`${styles.btn} ${styles.ghost}`} href="https://github.com/e7lang/e7/releases">Download</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
