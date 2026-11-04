# e7lang.github.io

Source of [e7lang.github.io](https://e7lang.github.io), the website of the
[E7 language](https://github.com/e7lang/e7), built with [Docusaurus](https://docusaurus.io).

| Path | What |
|---|---|
| `src/pages/index.js` | Landing page |
| `src/pages/playground.js`, `src/components/Playground.js` | In-browser playground (CodeMirror + Web Worker) |
| `static/playground/worker.js` | Worker that runs the E7 WebAssembly runtime |
| `src/components/playgroundExamples.js` | Playground examples (checked in CI) |
| `docs/*.md(x)` | Hand-written guides |
| `docs/reference/` | Generated: synced from `e7lang/e7/docs` and `lib/e7.d.ts` by `scripts/sync-docs.mjs` |

## Local development

```bash
npm ci
git clone https://github.com/e7lang/e7.git ../e7
npm run sync            # copy reference docs from ../e7
npm start               # http://localhost:3000
```

The playground needs the WebAssembly build of e7vm (requires [Emscripten](https://emscripten.org)):

```bash
emcmake cmake -S ../e7 -B ../e7/build-wasm -DCMAKE_BUILD_TYPE=Release
cmake --build ../e7/build-wasm
cp ../e7/build-wasm/e7wasm.{js,wasm} static/playground/
```

## Deployment

`.github/workflows/deploy.yml` builds the WebAssembly runtime from `e7lang/e7`, syncs the docs,
checks the playground examples, builds the site, runs a browser end-to-end test and deploys to
GitHub Pages on every push to `main` (and daily, to pick up changes in `e7lang/e7`).
Pages must be configured with **Settings → Pages → Source: GitHub Actions**.
