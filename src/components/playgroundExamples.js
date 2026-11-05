// Examples for the playground. CI runs each one through the WebAssembly build and checks the
// expected status (0 ok, 2 runtime error, 3 budget, 11 compile error): scripts/check-examples.mjs
export default [
  {
    "id": "hello",
    "title": "Hello, world",
    "code": "// Welcome to the E7 playground!\n// Press Run (or Ctrl/Cmd + Enter) to see the output on the right.\nconsole.log(\"Hello, world!\");\n",
    "expect": 0
  },
  {
    "id": "basics",
    "title": "Variables and functions",
    "code": "// Variables: `const` never changes, `let` can be reassigned.\nconst name = \"E7\";\nlet year: number = 2025;\nyear = year + 1;\n\n// Functions have typed parameters and a typed result.\nfunction greet(who: string): string {\n  return `Hello, ${who}!`;\n}\n\n// Arrow functions are handy for short helpers.\nconst add = (a: number, b: number): number => a + b;\n\nconsole.log(greet(name));\nconsole.log(\"Next year is\", year);\nconsole.log(\"2 + 3 =\", add(2, 3));\n",
    "expect": 0
  },
  {
    "id": "loops",
    "title": "Loops and conditions",
    "code": "// for loops, if / else and the ternary operator: the classic FizzBuzz.\nfor (let i = 1; i <= 15; i++) {\n  if (i % 15 === 0) {\n    console.log(\"FizzBuzz\");\n  } else if (i % 3 === 0) {\n    console.log(\"Fizz\");\n  } else {\n    console.log(i % 5 === 0 ? \"Buzz\" : String(i));\n  }\n}\n\n// while loops work too\nlet n = 1;\nwhile (n < 100) n = n * 2;\nconsole.log(\"first power of two >= 100:\", n);\n",
    "expect": 0
  },
  {
    "id": "arrays",
    "title": "Arrays and objects",
    "code": "// Arrays come with the usual methods: map, filter, reduce, sort, join, ...\nconst scores = [72, 95, 58, 88, 100];\nconst passed = scores.filter(s => s >= 60);\nconst total = scores.reduce((sum, s) => sum + s, 0);\nconsole.log(\"passed:\", passed.join(\", \"));\nconsole.log(\"average:\", total / scores.length);\n\n// Objects are described by interfaces.\ninterface Student { name: string; score: number }\nconst students: Student[] = [\n  { name: \"Ann\", score: 95 },\n  { name: \"Bob\", score: 72 },\n  { name: \"Cid\", score: 88 },\n];\nconst best = [...students].sort((a, b) => b.score - a.score)[0];\nconsole.log(`top student: ${best.name} (${best.score})`);\n",
    "expect": 0
  },
  {
    "id": "exports",
    "title": "Functions your app calls",
    "code": "// In a real app, scripts are compiled to bytecode and your app calls\n// the functions marked `export`, passing arguments and reading the result.\nexport function shippingCost(weightKg: number, express: boolean): number {\n  const base = 5 + weightKg * 2;\n  return express ? base * 1.5 : base;\n}\n\n// The playground calls an exported main() and shows its return value.\nexport function main(): string {\n  return `standard: ${shippingCost(3, false)}, express: ${shippingCost(3, true)}`;\n}\n",
    "expect": 0
  },
  {
    "id": "classes",
    "title": "Classes, closures, maps",
    "code": "// Interfaces, classes, closures, optional chaining and narrowing: all checked at compile time.\ninterface Order { id: string; amount: number; tags?: string[] }\n\nclass Ledger {\n  private items: Order[] = [];\n  add(o: Order): void { this.items.push(o); }\n  total(): number { return this.items.reduce((s, o) => s + o.amount, 0); }\n  find(id: string): Order | null { return this.items.find(o => o.id === id) ?? null; }\n}\n\nconst ledger = new Ledger();\nledger.add({ id: \"A1\", amount: 42.5 });\nledger.add({ id: \"B2\", amount: 7.5, tags: [\"promo\"] });\n\nconst o = ledger.find(\"B2\");\nif (o !== null) console.log(o.id, o.tags?.length ?? 0);   // narrowed: o is Order here\nconsole.log(ledger.total());\n\nfunction counter(): () => number {\n  let n = 0;\n  return () => ++n;\n}\nconst next = counter();\nnext(); next();\nconsole.log(\"counter:\", next());\n\nconst byTag = new Map<string, number>();\nfor (const tag of [\"a\", \"b\", \"a\", \"c\", \"a\"]) byTag.set(tag, (byTag.get(tag) ?? 0) + 1);\nconsole.log([...byTag.entries()].map(([k, v]) => `${k}=${v}`).join(\", \"));\n",
    "expect": 0
  },
  {
    "id": "integers",
    "title": "Numbers, integers, bigint",
    "code": "// number is an IEEE-754 double, exactly like JavaScript.\nconsole.log(0.1 + 0.2, 2 ** 53 + 1, 7 / 2);\n\n// Fixed-width integers are opt-in and wrap like machine integers.\nfunction fnv1a(data: Uint8Array): u32 {\n  let h: u32 = 0x811c9dc5;\n  for (const b of data) {\n    h ^= u32(b);\n    h *= 16777619;          // wraps modulo 2^32\n  }\n  return h;\n}\nconsole.log(fnv1a(new TextEncoder().encode(\"hello\")).toString(16));\nconsole.log(rotl32(u32(1), 31), clz32(u32(1)));\n\nconst big: u64 = 0xffffffffffffffff;\nconsole.log(big, big + 1);   // wraps to 0\n\n// bigint for arbitrary precision\nlet f = 1n;\nfor (let i = 1n; i <= 30n; i++) f *= i;\nconsole.log(\"30! =\", f.toString());\n",
    "expect": 0
  },
  {
    "id": "json",
    "title": "Typed JSON",
    "code": "// JSON.parse(text) as T validates the data against T while parsing.\ninterface Item { sku: string; qty: i32 }\ninterface Payment { orderId: string; amount: number; items: Item[]; note?: string }\n\nconst p = JSON.parse('{\"orderId\":\"A1\",\"amount\":12.5,\"items\":[{\"sku\":\"X\",\"qty\":2}]}') as Payment;\nconsole.log(p.orderId, p.items[0].qty * 2, p.note ?? \"(no note)\");\nconsole.log(JSON.stringify({ orderId: p.orderId, total: p.amount * 2 }));\n\n// A wrong shape stops the script immediately, with the exact path,\n// instead of failing somewhere later with a confusing error.\nconst bad = JSON.parse('{\"orderId\":\"A1\",\"amount\":\"12.5\",\"items\":[]}') as Payment;\nconsole.log(\"never printed\", bad.amount);\n",
    "expect": 2
  },
  {
    "id": "signing",
    "title": "API request signing (HMAC)",
    "code": "// API request signing: canonical query string + timestamp + HMAC-SHA256 (hex), as used by many\n// open platforms. The secret can be a host-held KeyHandle in production (see docs/EMBEDDING.md).\nimport { hmac, sha256 } from \"e7:crypto\";\nimport { hexEncode } from \"e7:encoding\";\n\nexport interface SignedRequest { query: string; signature: string; contentSha256: string }\n\nexport function canonicalQuery(params: Map<string, string>): string {\n  const keys = [...params.keys()].sort();\n  return keys.map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params.get(k)!)}`).join(\"&\");\n}\n\nexport function signRequest(method: string, path: string, params: Map<string, string>, body: string,\n                            secret: Uint8Array, timestamp: number, nonce: string): SignedRequest {\n  const enc = new TextEncoder();\n  const all = new Map<string, string>(params);\n  all.set(\"timestamp\", String(timestamp));\n  all.set(\"nonce\", nonce);\n  const query = canonicalQuery(all);\n  const contentSha256 = hexEncode(sha256(enc.encode(body)));\n  const stringToSign = [method.toUpperCase(), path, query, contentSha256].join(\"\\n\");\n  const signature = hexEncode(hmac(\"sha256\", secret, enc.encode(stringToSign)));\n  return { query, signature, contentSha256 };\n}\n\nconst params = new Map<string, string>([[\"amount\", \"100.00\"], [\"currency\", \"CNY\"], [\"memo\", \"Café order #42 ✓\"]]);\nconst r = signRequest(\"post\", \"/v1/pay\", params, '{\"item\":\"book\"}', new TextEncoder().encode(\"s3cr3t\"), 1700000000, \"n-001\");\nconsole.log(r.query);\nconsole.log(r.contentSha256);\nconsole.log(r.signature);\n",
    "expect": 0
  },
  {
    "id": "jwt",
    "title": "JSON Web Tokens (HS256 / ES256)",
    "code": "// JSON Web Tokens: HS256 sign/verify and ES256 verify (RFC 7519 / RFC 7515).\nimport { hmac, ecdsaSign, ecdsaVerify, ecdsaPublicKey, sha256, timingSafeEqual } from \"e7:crypto\";\nimport { base64UrlEncode, base64UrlDecode, utf8Encode, utf8Decode } from \"e7:encoding\";\n\ninterface Header { alg: string; typ: string }\ninterface Claims { sub: string; iat: number; exp: number; role: string }\n\nfunction b64json(s: string): string { return base64UrlEncode(utf8Encode(s)); }\n\nexport function signHS256(claims: Claims, key: Uint8Array): string {\n  const head = b64json(JSON.stringify({ alg: \"HS256\", typ: \"JWT\" }));\n  const body = b64json(JSON.stringify(claims));\n  const sig = hmac(\"sha256\", key, utf8Encode(`${head}.${body}`));\n  return `${head}.${body}.${base64UrlEncode(sig)}`;\n}\n\nexport function verify(token: string, key: Uint8Array, ecPublicKey: Uint8Array | null, now: number): Claims | null {\n  const parts = token.split(\".\");\n  if (parts.length !== 3) return null;\n  const header = JSON.parse(utf8Decode(base64UrlDecode(parts[0]))) as Header;\n  const signingInput = utf8Encode(`${parts[0]}.${parts[1]}`);\n  const sig = base64UrlDecode(parts[2]);\n  let ok = false;\n  if (header.alg === \"HS256\") ok = timingSafeEqual(hmac(\"sha256\", key, signingInput), sig);\n  else if (header.alg === \"ES256\" && ecPublicKey !== null) ok = ecdsaVerify(\"P-256\", \"sha256\", ecPublicKey, signingInput, sig);\n  if (!ok) return null;\n  const claims = JSON.parse(utf8Decode(base64UrlDecode(parts[1]))) as Claims;\n  return claims.exp > now ? claims : null;\n}\n\nconst key = utf8Encode(\"your-256-bit-secret\");\nconst claims: Claims = { sub: \"user-42\", iat: 1700000000, exp: 1700003600, role: \"admin\" };\nconst token = signHS256(claims, key);\nconsole.log(token);\nconsole.log(verify(token, key, null, 1700000100)?.role ?? \"invalid\");\nconsole.log(verify(token, key, null, 1800000000)?.role ?? \"expired\");\nconsole.log(verify(token.slice(0, -2) + \"xx\", key, null, 1700000100)?.role ?? \"bad signature\");\n// ES256 round trip (deterministic key for the demo)\nconst priv = sha256(utf8Encode(\"demo ec key\"));\nconst pub = ecdsaPublicKey(\"P-256\", priv);\nconst head = b64json(JSON.stringify({ alg: \"ES256\", typ: \"JWT\" }));\nconst body = b64json(JSON.stringify(claims));\nconst esig = ecdsaSign(\"P-256\", \"sha256\", priv, utf8Encode(`${head}.${body}`));\nconst es = `${head}.${body}.${base64UrlEncode(esig)}`;\nconsole.log(verify(es, key, pub, 1700000100)?.sub ?? \"invalid\");\n",
    "expect": 0
  },
  {
    "id": "ed25519",
    "title": "Ed25519 and X25519",
    "code": "// Ed25519 signatures and X25519 key agreement (Monocypher), SHA-256 / HMAC (BearSSL).\nimport { ed25519PublicKey, ed25519Sign, ed25519Verify, sha256, x25519 } from \"e7:crypto\";\nimport { hexEncode, utf8Encode, base64Encode } from \"e7:encoding\";\n\nconst seed = sha256(utf8Encode(\"demo seed - never derive real keys like this\"));\nconst pub = ed25519PublicKey(seed);\nconst msg = utf8Encode(\"pay 100 to alice\");\nconst sig = ed25519Sign(seed, msg);\n\nconsole.log(\"public key:\", hexEncode(pub));\nconsole.log(\"signature :\", base64Encode(sig));\nconsole.log(\"valid     :\", ed25519Verify(pub, msg, sig));\nconsole.log(\"tampered  :\", ed25519Verify(pub, utf8Encode(\"pay 900 to alice\"), sig));\n\n// Diffie-Hellman: both sides derive the same shared secret\nconst a = sha256(utf8Encode(\"alice\")), b = sha256(utf8Encode(\"bob\"));\nconst basepoint = new Uint8Array(32); basepoint[0] = 9;\nconst A = x25519(a, basepoint), B = x25519(b, basepoint);\nconsole.log(\"shared    :\", hexEncode(x25519(a, B)) === hexEncode(x25519(b, A)));\n",
    "expect": 0
  },
  {
    "id": "sandbox",
    "title": "Sandbox: runaway loop",
    "code": "// Scripts run in a sandbox: an instruction budget, a memory limit and a call-depth limit.\n// The playground runs with a budget of 500M instructions, so this loop is stopped safely.\nexport function main(): number {\n  let n = 0;\n  while (true) n++;\n  return n;\n}\n",
    "expect": 3
  },
  {
    "id": "errors",
    "title": "Compile-time type errors",
    "code": "// Type errors are reported at compile time, before anything runs.\ninterface User { name: string; age: number }\n\nfunction greet(u: User): string {\n  return \"Hi \" + u.nme;              // typo: property does not exist\n}\n\nconst u: User = { name: \"Ann\", age: \"30\" };   // string is not a number\nlet x = 1;\nx = \"one\";                            // no implicit any / type changes\n",
    "expect": 11
  }
];
