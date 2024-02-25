---
title: Using path aliases with tsc
description: Options for using TypeScript path aliases with tsc
published: 2024-02-25
---

The TypeScript compiler (`tsc`) does not change path aliases in import
specifiers, so they're still the same in compiled JavaScript:

```js title="index.js"
import { add } from '~/utils/calc.js';
```

However, this syntax is a compile-time feature and not supported during runtime
in Node.js, resulting in an error:

```shell
$ node index.js
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '~' imported from [...]/index.js
```

## Our Options

Using path aliases (or "path mapping") works out of the box when using something
like Parcel, Webpack, Rollup or esbuild, or a framework powered by such a
bundler. Note that the Bun runtime transpiles TypeScript files on the fly and
supports path aliases.

But if you target runtimes such as Node.js, use `tsc` directly in a more vanilla
setup, and want to start using path aliases, you'll need to set this up
yourself. We'll look at three approaches:

1. Subpath imports
2. Build time resolution
3. Runtime resolution

## Option 1: Subpath Imports

Using only `tsc` and subpath imports is a runtime and dependency-free option for
aliases that start with a `#hash`:

```js title="index.js"
import { add } from '#utils/calc.js';
```

Here's how the `paths` configuration for `tsc` could look like:

```json title="tsconfig.json"
{
  "compilerOptions": {
    "paths": {
      "#utils/*": ["./src/utils/*"],
      "#sub/*": ["./src/sub/path/*"]
    }
  }
}
```

Internal subpath `imports` configuration in `package.json` must follow this. Use
private mappings and target the compiled output:

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
    "typescript": "5.3.3"
  }
}
```

Using `*.js` in subpath imports configuration is essentially the same as
`**/*.js` in glob patterns, so it recurses into subdirectories.

Pros:

- Supported natively by both `tsc` and Node.js ([subpath imports][1] were
  introduced in Node.js v12.19.0/v14.6.0).

Cons:

- Restricted to what subpath imports support:
  - They must be prefixed with `#`.
  - The prefix-only alias like `#/*.js` is invalid.
  - Each alias targets only one location.
- Need to keep two configurations in sync.

## Option 2: Build time resolution

Use [tsc-alias][2] to convert all path aliases to relative paths in the output
that `tsc` generates:

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
- No performance hit during runtime

Cons:

- Requires a dependency (e.g. `tsc-alias`).

## Option 3: Runtime resolution

Other solutions work at runtime. A popular option is [tsconfig-paths][3].

After compilation with `tsc` you can use a dependency like `tsconfig-paths` as a
loader to convert the import paths during runtime:

```shell
node -r tsconfig-paths/register main.js
```

Pros:

- Use path aliases as supported by TypeScript.
- No duplicate configuration.

Cons:

- Requires a dependency (e.g. `tsc-alias`).
- Requires injection of a loader on command line or in code
- Small(?) performance hit during runtime

## Recommendations

The first option using subpath imports requires no extra dependencies, but is
somewhat limited. The third option involves adding a loader which isn't always
desired or even possible. Each option has its own advantages, but in general I'd
recommend the second option for three reasons:

1. You can use TypeScript path aliases to their full extent.
2. It's a build time solution, eliminating the risk of running the code in an
   environment where path aliases are not supported.
3. No performance hit during runtime.

In addition, I'd recommend to separate the prefixes:

- Use `@` for external scoped npm packages.
- Use `~` for internal TypeScript path aliases.
- Use `#` for internal subpath imports.

This results in easier recognition, searching and refactors of the various types
of import specifiers, without potential conflicts.

## Resources

- [TS Config reference → paths][4]
- [Node.js → subpath imports][1]
- [tsc-alias][2]
- [tsconfig-paths][3]

[1]: https://nodejs.org/api/packages.html#subpath-imports
[2]: https://www.npmjs.com/package/tsc-alias
[3]: https://www.npmjs.com/package/tsconfig-paths
[4]: https://www.typescriptlang.org/tsconfig#paths
