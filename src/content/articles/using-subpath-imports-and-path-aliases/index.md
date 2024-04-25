---
title: Using subpath imports & path aliases
description: Options for using subpath imports & path aliases in TypeScript
published: 2024-02-25
modified: 2024-02-29
---

Subpath imports and TypeScript path aliases are useful and convenient features,
especially in large codebases. Both are pretty widely supported across runtimes
and bundlers for the web. However, the situation is different in more "vanilla"
setups when using the TypeScript compiler (`tsc`) directly.

This article is about using subpath imports and path aliases with `tsc`.
Specifically, we're going to discuss two pitfalls when compiling to JavaScript
for a runtime like Node.js:

- [Subpath imports][1] are less well-known, and not fully supported in IDEs
  before TypeScript v5.4.
- [TypeScript path aliases][2] are not supported by Node.js.

_tl/dr;_ See the [recommendations][3] and [closing note][4] at the end.

## Subpath imports

Subpath imports are configured in `package.json`, They're a runtime and
dependency-free option to use aliases. Here's an example import with a hash
specifier:

```js title="index.js"
import { add } from '#utils/calc.js';
```

Internal subpath `imports` are configured in `package.json` like so:

```json title="package.json"
{
  "name": "my-lib",
  "version": "1.0.0",
  "imports": {
    "#utils/*.js": "./lib/utils/*.js",
    "#sub/*.js": "./lib/sub/path/*.js"
  }
}
```

Using `*.js` in subpath imports configuration is essentially the same as
`**/*.js` in glob patterns, so it recurses into subdirectories.

Make sure to check out the [Node.js → subpath imports][5] documentation for more
features, such as conditional exports.

### Problem

Support for subpath imports in `package.json` has been in TypeScript since v4.5,
so `tsc` compiles them just fine. But the TypeScript Language Server did not
fully catch up until v5.4.

### Solution (option 1)

Upgrade TypeScript to v5.4.0+ and use only a single subpath `"imports"`
configuration in `package.json`:

```json title="package.json"
{
  "imports": {
    "#utils/*.js": "./dist/utils/*.js",
    "#sub/*.js": "./dist/sub/path/*.js"
  },
  "scripts": {
    "build": "tsc"
  },
  "dependencies": {
    "typescript": "5.4.0"
  }
}
```

(Install `typescript@beta` until `latest` is `5.4.0` or higher.)

TypeScript will resolve paths properly and prioritize the aliases with
auto-import suggestions in your IDE. Here's an example of how that looks like:

![Auto-import suggestion][6]

Pros:

- Supported natively by Node.js (since v12.19.0/v14.6.0) and fully supported in
  TypeScript since v5.4.0.
- Subpath imports can make use of [conditional exports][7].

Cons:

- Syntax is restricted to what subpath imports support:
  - The `#hash` specifier syntax must be used (not `@` or `~`).
  - The `"#/*"` alias is invalid, but as short as e.g. `"#@/*"` is valid.

If you have path aliases configured in `tsconfig.json` you'd need to replace
them with subpath imports across your codebase.

If this is not an option for you, let's discuss some alternatives.

## TypeScript path aliases

Path aliases are a similar feature to subpath imports. Here's an example
configuration for the TypeScript compiler:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "paths": {
      "~/utils/*": ["./src/utils/*"],
      "~/sub/*": ["./src/sub/path/*"]
    }
  }
}
```

### Problem

The TypeScript compiler (`tsc`) does not rewrite import specifiers, so they're
still the same when compiled to JavaScript:

```js title="index.js"
import { add } from '~/utils/calc.js';
```

However, this syntax is not supported during runtime in Node.js, resulting in an
error:

```shell
$ node index.js
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '~' imported from [...]/index.js
```

### Solution

We have some options here:

1. Switch to [subpath imports with TypeScript v5.4.0+][8]
2. [Build time resolution][9]
3. [Runtime resolution][10]

## Option 2: Build time resolution

You can use path aliases and [tsc-alias][11] to convert them after the fact to
relative paths in the output that `tsc` generates:

```json title="package.json"
{
  "scripts": {
    "build": "tsc && tsc-alias"
  },
  "dependencies": {
    "tsc-alias": "1.8.8",
    "typescript": "5.3.3"
  }
}
```

```json title="tsconfig.json"
{
  "compilerOptions": {
    "paths": {
      "~/*": ["./src/*"],
      "~such/path/*": ["./src/much/wow/*"]
    }
  }
}
```

Pros:

- Use path aliases as supported by TypeScript.
- No duplicate configuration.
- No performance hit during runtime.

Cons:

- Requires a dependency (e.g. `tsc-alias`).

## Option 3: Runtime resolution

Other solutions work at runtime. A popular option is [tsconfig-paths][12].

After compilation with `tsc` you can use a dependency like `tsconfig-paths` as a
loader to convert the import paths during runtime:

```shell
node -r tsconfig-paths/register main.js
```

Pros:

- Use path aliases as supported by TypeScript.
- No duplicate configuration.

Cons:

- Requires a dependency (e.g. `tsconfig-paths`).
- Requires injection of a loader via command line or in code.
- Small(?) performance hit during runtime.

## Recommendations

### 1. Relative paths

Your safest bet is to use no subpath imports or path aliases at all.

### 2. Subpath imports

Second best is to use only subpath imports ([option 1][8]), if supported by
other tooling in your project such as TypeScript, test runners and code linters.
The Node.js and Bun runtimes do support it.

### 3. Path aliases + build time resolution

And if that's not an option yet, I'd recommend to use path aliases with build
time resolution ([option 2][9]). This is fairly well supported across tooling
today. There's no runtime performance hit, and no risk of running the code in an
environment that has no support.

Check out the documentation of your tooling to see what's supported.

## Closing Note

Subpath imports are perhaps less well known and less used today compared to
TypeScript path aliases, but likely to become even more of a standard in the
future. So subpath imports are generally recommended over path aliases going
forward, especially considering support in TypeScript v5.4 has fully caught up.

## Resources

- [Node.js → subpath imports][5]
- [TS Config reference → paths][13]
- [tsc-alias][11]
- [tsconfig-paths][12]

[1]: #subpath-imports
[2]: #typescript-path-aliases
[3]: #recommendations
[4]: #closing-note
[5]: https://nodejs.org/api/packages.html#subpath-imports
[6]: ./auto-import-suggestion.png
[7]: https://nodejs.org/api/packages.html#conditional-exports
[8]: #solution-option-1
[9]: #option-2-build-time-resolution
[10]: #option-3-runtime-resolution
[11]: https://www.npmjs.com/package/tsc-alias
[12]: https://www.npmjs.com/package/tsconfig-paths
[13]: https://www.typescriptlang.org/tsconfig#paths
