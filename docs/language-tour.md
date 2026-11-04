---
sidebar_position: 3
title: Language tour
description: The E7 language in ten minutes - types, classes, integers, typed JSON and crypto.
---

# Language tour

E7 is TypeScript with the dynamic parts removed. If you know TypeScript you already know
almost all of it; this page shows what is the same, what is stricter, and what is extra.
Every snippet runs as-is in the **[playground](/playground)**.

## Hello, world

```ts
console.log("Hello, world!");

const name: string = "E7";
console.log(`Hello, ${name}! 2 + 3 = ${2 + 3}`);
```

Top-level code runs when the module is loaded. Functions marked `export` can be called by the
host app; the CLI and the playground call `main` when it is exported.

## Types are checked, not guessed

There is no `any`. Every name and every expression has a type known at compile time, and
nullable values must be narrowed before use.

```ts
interface Order { id: string; amount: number; tags?: string[] }

class Ledger {
  private items: Order[] = [];
  add(o: Order): void { this.items.push(o); }
  total(): number { return this.items.reduce((s, o) => s + o.amount, 0); }
  find(id: string): Order | null { return this.items.find(o => o.id === id) ?? null; }
}

const ledger = new Ledger();
ledger.add({ id: "A1", amount: 42.5 });
ledger.add({ id: "B2", amount: 7.5, tags: ["promo"] });

const o = ledger.find("B2");
if (o !== null) console.log(o.id, o.tags?.length ?? 0);   // narrowed: o is Order here
console.log(ledger.total());                               // 50
```

Supported: interfaces, type aliases, enums, tuples, union types with `null`/`undefined`,
classes with single inheritance, `super`, static members and parameter properties, closures,
destructuring, spread, `?.`, `??`/`??=`, `switch`, labeled `break`/`continue`, multi-file
`import`/`export`, and narrowing on `=== null`, truthiness and `instanceof`.

## Numbers behave like JavaScript

`number` is an IEEE-754 double with exactly JavaScript's semantics, including printing:

```ts
console.log(0.1 + 0.2, 2 ** 53 + 1, 7 / 2);   // 0.30000000000000004 9007199254740992 3.5
```

## Machine integers, on request

When an algorithm needs real machine integers, use `i8`, `u8`, `i16`, `u16`, `i32`, `u32`,
`i64` or `u64`. They wrap on overflow and compile to single instructions. Conversions are always
explicit.

```ts
function fnv1a(data: Uint8Array): u32 {
  let h: u32 = 0x811c9dc5;
  for (const b of data) {
    h ^= u32(b);
    h *= 16777619;          // wraps modulo 2^32
  }
  return h;
}
console.log(fnv1a(new TextEncoder().encode("hello")).toString(16));   // 4f9f2cab
console.log(rotl32(u32(1), 31), clz32(u32(1)));                       // 2147483648 31
```

`bigint` is available for arbitrary precision (`30n`, `f *= i`, `f.toString()`).

## JSON that checks itself

`JSON.parse(text) as T` validates the data against `T` while parsing. A wrong shape stops the
script immediately with the exact path, instead of failing later somewhere else.

```ts
interface Payment { orderId: string; amount: number; items: { sku: string; qty: i32 }[] }

const p = JSON.parse('{"orderId":"A1","amount":12.5,"items":[{"sku":"X","qty":2}]}') as Payment;
console.log(p.items[0].qty * 2);   // 4

const bad = JSON.parse('{"orderId":"A1","amount":"12.5","items":[]}') as Payment;
// JSON.parse: expected a number at $.amount
```

## Errors are values

E7 has no `try`/`catch`. `throw`, failed assertions and runtime errors (index out of range,
`null` access, budget exhausted) stop the script and report a stack trace to the host. Expected
failures are modelled as return values:

```ts
function parsePort(s: string): number | null {
  const n = Number(s);
  return Number.isInteger(n) && n > 0 && n < 65536 ? n : null;
}
for (const s of ["8080", "http"]) {
  const port = parsePort(s);
  console.log(port === null ? `${s}: invalid` : `${s}: port ${port}`);
}
```

## Crypto and encodings, built in

`e7:crypto` and `e7:encoding` run as native code (BearSSL and Monocypher), so scripts only
assemble parameters.

```ts
import { ed25519Verify, hmac, sha256 } from "e7:crypto";
import { base64UrlDecode, hexEncode } from "e7:encoding";

// Verify a webhook: HMAC-SHA256 over "timestamp.body"
export function verifyWebhook(secret: Uint8Array, ts: string, body: string, sigHex: string): boolean {
  const enc = new TextEncoder();
  return hexEncode(hmac("sha256", secret, enc.encode(`${ts}.${body}`))) === sigHex;
}

// Verify an Ed25519-signed license token: base64url(payload).base64url(signature)
export function checkLicense(publicKey: Uint8Array, token: string): boolean {
  const [payload, sig] = token.split(".");
  return ed25519Verify(publicKey, base64UrlDecode(payload), base64UrlDecode(sig));
}

console.log(hexEncode(sha256(new TextEncoder().encode("abc"))).slice(0, 16));   // ba7816bf8f01cfea
```

- Hashes: SHA-1, SHA-2, SHA-3, MD5; HMAC, HKDF, PBKDF2
- Ciphers: AES-GCM / CBC / CTR, ChaCha20-Poly1305
- Signatures and key agreement: Ed25519, X25519, ECDSA P-256/384/521, RSA PKCS#1 v1.5 and PSS
- Encodings: hex, base64, base64url, base32, UTF-8, PEM

A `KeyHandle` lets a script use a key kept in the Keychain, Keystore or DPAPI without the key
bytes ever entering script memory. See the [embedding guide](reference/EMBEDDING.md).

## What is not supported

`any`, `eval`, `try`/`catch`, `async`/`await`, generators, `for…in`, user-defined generics,
index signatures (use `Map<K, V>`), getters/setters, `#private`, and dynamic property access
on objects. Each one is rejected at compile time with a clear message. The
[language spec](reference/SPEC.md) has the complete list.
