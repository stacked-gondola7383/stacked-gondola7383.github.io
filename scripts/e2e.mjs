// End-to-end check of the built site in a real browser: pages render without errors and the
// playground compiles and runs E7 through the WebAssembly runtime.
//   npm run build && npx docusaurus serve --port 3210 &   then   node scripts/e2e.mjs [base-url]
import { chromium } from "playwright";

const base = process.argv[2] || "http://localhost:3210";
const browser = await chromium.launch();
let failures = 0;
const check = (cond, msg) => { console.log(`${cond ? "ok  " : "FAIL"} ${msg}`); if (!cond) failures++; };

async function open(path, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: opts.width || 1280, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  const res = await page.goto(base + path, { waitUntil: "networkidle" });
  return { page, ctx, errors, status: res ? res.status() : 0 };
}

for (const path of ["/", "/docs/intro", "/docs/getting-started", "/docs/language-tour", "/docs/host-apps",
                    "/docs/reference/SPEC", "/docs/reference/stdlib", "/docs/reference/EMBEDDING"]) {
  const { page, ctx, errors, status } = await open(path);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  check(status === 200 && errors.length === 0 && !overflow, `${path} (status ${status}${errors.length ? ", errors: " + errors.join(" | ") : ""}${overflow ? ", horizontal overflow" : ""})`);
  await ctx.close();
}

{
  const { page, ctx, errors } = await open("/playground");
  const status = page.locator("text=/Ready · e7 /");
  await status.waitFor({ timeout: 30000 });
  check(true, "playground: WebAssembly runtime loaded (" + (await status.textContent()) + ")");

  const out = page.locator("pre").last();
  await page.click("#e7-run");
  await page.locator("text=/^ok · /").waitFor({ timeout: 30000 });
  const text = await out.textContent();
  check(text.includes("Hello, world!"), "playground: default hello-world example runs");

  await page.selectOption("select", "loops");
  await page.click("#e7-run");
  await page.locator("text=/^ok · /").waitFor({ timeout: 30000 });
  check((await out.textContent()).includes("FizzBuzz"), "playground: loops example");

  await page.selectOption("select", "exports");
  await page.click("#e7-run");
  await page.locator("text=/^ok · /").waitFor({ timeout: 30000 });
  check((await out.textContent()).includes('main() → "standard: 11, express: 16.5"'), "playground: exported main() result shown");

  // sandbox example: budget exhaustion is reported, the page stays responsive
  await page.selectOption("select", "sandbox");
  await page.click("#e7-run");
  await page.locator("text=/instruction budget exhausted · /").waitFor({ timeout: 60000 });
  check((await out.textContent()).includes("instruction budget exhausted"), "playground: runaway loop stopped by the budget");

  // compile errors
  await page.selectOption("select", "errors");
  await page.click("#e7-run");
  await page.locator("text=/compile error · /").waitFor({ timeout: 30000 });
  check((await out.textContent()).includes("property 'nme' does not exist"), "playground: compile errors shown");

  // crypto example
  await page.selectOption("select", "ed25519");
  await page.click("#e7-run");
  await page.locator("text=/^ok · /").waitFor({ timeout: 30000 });
  const crypto = await out.textContent();
  check(crypto.includes("valid     : true") && crypto.includes("tampered  : false") && crypto.includes("shared    : true"), "playground: Ed25519/X25519 example");

  // bytecode tab
  await page.getByRole("tab", { name: "Bytecode" }).click();
  await page.locator("text=/func #\\d+ <init>/").waitFor({ timeout: 30000 });
  check(true, "playground: bytecode listing");

  // share link round-trip
  await page.getByRole("tab", { name: "Output" }).click();
  await page.getByRole("button", { name: "Share" }).click();
  const url = page.url();
  check(url.includes("#code="), "playground: share link created");
  const second = await open(url.replace(base, ""));
  await second.page.locator("text=/Ready · e7 /").waitFor({ timeout: 30000 });
  const editorText = await second.page.locator(".cm-content").textContent();
  check(editorText.includes("ed25519PublicKey"), "playground: share link restores the code");
  await second.ctx.close();

  check(errors.length === 0, "playground: no console errors" + (errors.length ? ": " + errors.join(" | ") : ""));
  await ctx.close();
}

await browser.close();
if (failures) { console.error(`${failures} check(s) failed`); process.exit(1); }
console.log("all end-to-end checks passed");
