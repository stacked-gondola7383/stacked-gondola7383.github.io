---
slug: /intro
sidebar_position: 1
title: What is E7?
description: E7 is a strict TypeScript subset and e7vm is a small, verified bytecode VM for running scripts inside apps.
---

# What is E7?

**E7** is a strictly typed subset of TypeScript. **e7vm** is a small bytecode virtual machine,
written in C++17, that runs E7 programs inside your application on Android, iOS, Windows, macOS
and Linux.

It was built for one job: shipping **algorithms that change faster than your app** (request
signing, signature verification, webhook checks, license validation) as small scripts that your
server compiles and your app downloads and runs, without a new app release.

![E7 architecture](/img/architecture-light.png#gh-light-mode-only)![E7 architecture](/img/architecture-dark.png#gh-dark-mode-only)

## Why not just embed JavaScript?

| | E7 + e7vm | A JavaScript engine |
|---|---|---|
| Types | Checked at compile time; no `any` | Dynamic |
| Input to the app | Compact bytecode, **verified** before it runs | Source text |
| Untrusted code | Verifier + instruction budget + memory limit + call-depth limit | Depends on the engine |
| Secrets | `KeyHandle`: a script can sign with a key it can never read | Key bytes in script memory |
| Size | About 470 KB with crypto (920 KB with the on-device compiler) | Several MB |
| JIT | None; pure interpreter, App Store safe | Usually disabled on iOS anyway |
| Crypto | SHA-2/3, HMAC, HKDF, PBKDF2, AES-GCM, ChaCha20-Poly1305, Ed25519, X25519, ECDSA, RSA (native) | Bring your own |

Every E7 program is also valid TypeScript: VS Code, `tsc --strict` and Node.js run it
unchanged, and differential tests check that e7vm prints exactly what Node.js prints.

## What can I write?

Ordinary TypeScript: `let`/`const`, functions and closures, arrow functions, classes with single
inheritance, interfaces, enums, generics on built-in containers, destructuring, spread, template
strings, optional chaining, `??`, `for…of`, `Map`, `Set`, `Uint8Array`, `bigint`, `JSON`,
`Date`, `Math`, and the `e7:crypto` / `e7:encoding` modules. Fixed-width integers (`i8` … `u64`)
are there when an algorithm needs machine arithmetic.

What is left out is what can't be checked statically or run safely: `any`, `eval`, dynamic
property access on objects, `try`/`catch` (scripts return error values; failures stop the
script), `async`, and user-defined generics. The [language spec](reference/SPEC.md) has the full list.

**Try it now in the [playground](/playground)**: the real compiler and VM, compiled to
WebAssembly, running in your browser.

## Where next?

- [Getting started](getting-started.mdx): install, write, compile and run a script.
- [Language tour](language-tour.md): the language in ten minutes.
- [Calling scripts from your app](host-apps.mdx): C, Kotlin, Swift and C#.
- [Embedding guide](reference/EMBEDDING.md): the full C API, keys, budgets and signing.
