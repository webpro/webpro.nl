---
published: 2023-09-14
description: How to use a compiled bin in a TypeScript monorepo with pnpm
---

# How to use a compiled bin in a TypeScript monorepo with pnpm

Today's scrap has a very long title and is about pnpm workspaces that contain a
compiled executable in a TypeScript monorepo.

## Problem

When running `pnpm install` in a monorepo, the local `bin` file of a workspace
may not exist yet. This happens when that file needs to be generated first (e.g.
when using TypeScript). Then `pnpm` is unable to link the missing file. This
also results in errors when trying to execute the `bin` from another workspace.

_tl/dr;_ Make sure the referenced file in the `bin` field of `package.json`
exists, and import the generated file from there.

## Solution

So how to safely use a compiled bin? Let's assume this situation:

- The entry script for the CLI tool is at `src/cli.ts`
- This source file is compiled to `lib/cli.js`
- Compiled by the `build` script that runs `tsc`

Here are some relevant bits in the `package.json` file of the workspace that
wants to expose the `bin`:

```json
{
  "name": "@org/my-cli-tool",
  "bin": {
    "my-command": "bin/my-command.js"
  },
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "pnpm run build"
  },
  "files": ["bin", "lib"]
}
```

Use `"type": "module"` to publish as ESM in `package.json`. Import the generated
file from `bin/my-command.js`:

```js
#!/usr/bin/env node
import '../lib/cli.js';
```

Publishing as CommonJS? Then use `require`:

```js
#!/usr/bin/env node
require('../lib/cli.js');
```

Make sure to include the shebang (that first line starting with `#!`), or
consumers of your package will see errors like this:

```sh
bin/my-command: line 1: syntax error near unexpected token `'../lib/index.js''
```

## Publishing

In case the package is supposed to be published, use the `prepublishOnly` script
and make sure to include both the `bin` and `lib` folders in the `files` field
(like in the example above).

## A note about `postinstall` scripts

Using a `postinstall` script to create the file works since [pnpm v8.6.6][1],
but `postinstall` scripts should be avoided when possible:

- Can perform malicious acts (security scanners don't like them)
- Can be disabled by the consumer using ` --ignore-scripts`

That's why this little guide doesn't promote it, and this scrap got longer than
I wanted!

## Additional notes

- This scrap is based on [this GitHub comment][2] in the pnpm repository.
- I've seen and tried workarounds to (`mkdir` and) `touch` the file from
  `postinstall` scripts, but that's flaky at best and not portable.
- The same issue might occur when using `npm` and/or `Yarn`. True or not, it's
  better to be safe than sorry.
- If you are using only JavaScript (or JavaScript with TypeScript in JSDoc) then
  you can target the `src/cli.js` file directly from the `bin` field.

[1]: https://github.com/pnpm/pnpm/releases/tag/v8.6.6
[2]: https://github.com/pnpm/pnpm/issues/1801#issuecomment-798423695
