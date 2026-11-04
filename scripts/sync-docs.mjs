// Copies the reference docs from the e7 repository into docs/reference/ so the website always
// shows the same text as the code it documents.
//   node scripts/sync-docs.mjs [path-to-e7-checkout]   (default: ../e7, then ./e7)
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const candidates = [process.argv[2], process.env.E7_SRC, "e7", "../e7", "../e7fvm"].filter(Boolean);
const src = candidates.map((p) => resolve(p)).find((p) => existsSync(join(p, "docs", "SPEC.md")));
if (!src) {
  console.error("sync-docs: e7 checkout not found (tried " + candidates.join(", ") + ")");
  process.exit(1);
}

const out = resolve("docs/reference");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const pages = [
  { file: "SPEC.md", label: "Language spec", pos: 1, desc: "The E7 language: what TypeScript is accepted and how it behaves." },
  { file: "EMBEDDING.md", label: "Embedding (C API)", pos: 3, desc: "Embedding e7vm in Android, iOS, Windows, macOS and Linux apps." },
  { file: "BYTECODE.md", label: "Bytecode format", pos: 4, desc: "The .e7b module format and the instruction set." },
  { file: "DESIGN.md", label: "Design notes", pos: 5, desc: "Why E7 and e7vm are designed the way they are." },
  { file: "PRODUCTION.md", label: "Production checklist", pos: 6, desc: "Verification evidence: tests, fuzzing, sanitizers, reviews." },
];

const repo = "https://github.com/e7lang/e7/blob/main/";
for (const p of pages) {
  let md = readFileSync(join(src, "docs", p.file), "utf8");
  // links that point outside docs/ (source files, README, examples) go to GitHub
  md = md.replace(/\]\((\.\.\/)([^)#\s]+)(#[^)]*)?\)/g, (_, _up, path, hash = "") => `](${repo}${path}${hash})`);
  md = md.replace(/\]\((?!https?:|#|mailto:)([^)#\s]+\.(?:ts|c|cpp|h|java|kt|swift|cs|json|sh|yml|mmd))(#[^)]*)?\)/g,
    (_, path, hash = "") => `](${repo}docs/${path}${hash})`);
  md = md.replace(/\]\(architecture-(light|dark)\.png\)/g, "](/img/architecture-$1.png)");
  const front = `---\nsidebar_label: ${JSON.stringify(p.label)}\nsidebar_position: ${p.pos}\ndescription: ${JSON.stringify(p.desc)}\n---\n\n`;
  writeFileSync(join(out, p.file), front + md);
  console.log("synced", p.file);
}

// architecture diagram: one light and one dark variant (transparent PNGs), rendered in the e7 repo
for (const t of ["light", "dark"]) {
  copyFileSync(join(src, "docs", `architecture-${t}.png`), resolve(`static/img/architecture-${t}.png`));
}
console.log("synced architecture-light.png / architecture-dark.png");

// the standard library reference is generated from lib/e7.d.ts
const dts = readFileSync(join(src, "lib", "e7.d.ts"), "utf8");
writeFileSync(join(out, "stdlib.md"), `---
sidebar_label: "Standard library (e7.d.ts)"
sidebar_position: 2
description: "Every built-in function, class and module available to E7 scripts."
---

# Standard library

These are the complete declarations of everything an E7 script can use: the built-in globals,
fixed-width integer types, and the \`e7:crypto\` / \`e7:encoding\` modules. The same file ships in
every release as \`types/e7.d.ts\`; add it to your \`tsconfig.json\` to get editor completion and
\`tsc --strict\` checking for E7 scripts.

\`\`\`ts title="e7.d.ts"
${dts.trimEnd()}
\`\`\`
`);
console.log("synced stdlib.md from lib/e7.d.ts");
