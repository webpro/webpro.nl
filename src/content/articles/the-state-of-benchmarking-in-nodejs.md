---
published: 2023-12-21
description: The State of Benchmarking in Node.js
---

# The State of Benchmarking in Node.js

Benchmarking becomes more important as we build more and more applications and
tooling for runtimes like Node.js and Bun. This article discusses macro and
micro benchmarking, and explores options we can use today to benchmark code. The
article includes code examples and a CodeSandbox to try and implement in your
own applications.

## Contents

- [Macro benchmarking](#macro-benchmarking)
  - [Ecosystem](#ecosystem)
  - [Example: PerformanceObserver for functions](#example-performanceobserver-for-functions)
  - [Example: timerify application code](#example-timerify-application-code)
- [Micro benchmarking](#micro-benchmarking)
  - [Ecosystem](#ecosystem-1)
  - [Pitfalls](#pitfalls)
  - [Example: string concatenation](#example-string-concatenation)
  - [Benchmark.js](#benchmarkjs)
  - [Tinybench](#tinybench)
  - [A CLI, maybe?](#a-cli-maybe)
- [Conclusion](#conclusion)

## Macro benchmarking

Benchmarking a part of your application code is an important scenario. While
running a real-world application, how many times are expensive functions called
and how much time is spent in each? These are essential metrics for any CPU
intensive code such as bundlers, compilers, linters, formatters, and so on.

Not many of those tools are using the [node:perf_hooks][13] module, while much
of this native module is available since Node.js v8.5.0 (released over 6 years
ago). This included `performance.now()`, `performance.timerify()` and
`PerformanceObserver`, and the built-in module has been improved and extended
ever since. This module allows to integrate all sorts of performance timings
right into your application.

### Ecosystem

There aren't that many libraries or runners on top of the Node.js built-ins. I
sure hope I'm missing something, but here are some data points at the time of
writing:

- 1 package found for [npmjs.com/search?q=timerify][14]
- 4 packages found for [npmjs.com/search?q=PerformanceObserver][15]
- 32 hits for [npmjs.com/search?q=perf_hooks][16]
- a few hits for [twitter.com/search?q=perf_hooks][17]

I think there's room for tooling in this space to reduce boilerplate and improve
accessibility. For instance, it would help a lot if we could import a utility to
wrap functions in any application, and render or return metrics about the
wrapped functions as needed.

### Example: PerformanceObserver for functions

Let's look at an example which logs each recorded function invocation with a
`PerformanceObserver` instance:

```ts
const fnObserver = new PerformanceObserver(items => {
  items.getEntries().forEach(entry => {
    console.log(entry);
  });
  fnObserver.disconnect();
});
fnObserver.observe({ entryTypes: ['function'] });

function myFunctionUnderTest() {
  // Such intensive, very cpu, much wow
}

const wrapped = performance.timerify(myFunctionUnderTest);

wrapped();
wrapped();
wrapped();
```

This will log three `PerformanceEntry` objects and one of the properties is
`duration`:

```shell
$ node observer.mjs
PerformanceNodeEntry {
  name: 'myFunctionUnderTest',
  entryType: 'function',
  startTime: 20.211291000247,
  duration: 0.02987500000745058,
  detail: []
}
PerformanceNodeEntry {
  name: 'myFunctionUnderTest',
  entryType: 'function',
  startTime: 20.426791000179946,
  duration: 0.0017919996753335,
  detail: []
}
PerformanceNodeEntry {
  name: 'myFunctionUnderTest',
  entryType: 'function',
  startTime: 20.432208000682294,
  duration: 0.0006669992581009865,
  detail: []
}
```

Now we have a basis to record the number of calls to a function and the duration
of each call.

**Note**: this article focuses on the `function` performance entry type. Other
valid `entryTypes` include `mark`, `measure`, `http`, `net` and `dns`. See the
[Node.js docs on perf_hooks][18] for more details and examples.

### Example: timerify application code

Expanding on this idea, I was hoping there would be utilities to make this
easier and more accessible, but unfortunately I didn't find much.

Since Node.js provides the building blocks, I created this [Performance.js class
in Knip][19] last year. I've been meaning to turn this into a separate module to
be published, but haven't got around doing this.

For this article I created a modified version to try and play with. The code is
in [this CodeSandbox][20].

Run the demo from the terminal inside the sandbox:

```shell
node index.js --performance
```

Here's the gist of it, again with the `PerformanceObserver` class and
`performance.timerify()` function as the main building blocks:

```js
import { performance, PerformanceObserver } from 'node:perf_hooks';
import EasyTable from 'easy-table';
import { parseArgs } from 'node:util';

export const timerify = fn => (isEnabled ? performance.timerify(fn) : fn);

export class Performance {
  constructor(isEnabled) {
    if (isEnabled) {
      this.startTime = performance.now();

      this.fnObserver = new PerformanceObserver(items => {
        items.getEntries().forEach(entry => this.entries.push(entry));
      });
      this.fnObserver.observe({ entryTypes: ['function'] });
    }
  }

  getTable() {
    const entriesByName = this.entries;
    const table = new EasyTable();
    // ..build table..
    return table.toString().trim();
  }

  getTotalTime() {
    return this.endTime - this.startTime;
  }

  async finalize() {
    this.endTime = performance.now();
  }
}
```

And here's how to use it in any real-world application:

```js
const fnA = ms => new Promise(r => setTimeout(r, ms));
const fnB = ms => new Promise(r => setTimeout(r, ms));

const wrappedA = isEnabled ? timerify(fnA) : fnA; // (1) Wrap functions
const wrappedB = isEnabled ? timerify(fnB) : fnB; // to get metrics when called

async function myApplication() {
  await Promise.all([wrappedA(100), wrappedA(200), wrappedA(300)]);
  await wrappedB(500);
}

// (2) Installs PerformanceObserver#observe({ entryTypes: ['function'] }) to observe functions
const perfObserver = new Performance(isEnabled);

await myApplication();

await perfObserver.finalize();
console.log(perfObserver.getTable());
console.log('Total running time:', prettyMs(perfObserver.getTotalTime()));

perfObserver.reset();
```

After running this, here's some example output:

```shell
$ node performance.mjs --performance
Name  size  min     max     median  sum
----  ----  ------  ------  ------  ------
fnA      3  101.18  300.59  200.70  602.47
fnB      1  502.24  502.24  502.24  502.24
Total running time: 804ms
```

The functions are only wrapped when using the `--performance` flag. Without the
flag, the functions are not wrapped and there is no overhead.

## Micro benchmarking

Benchmarking arbitrary code in isolation is important too. Sometimes you want to
benchmark and compare two or more ways to do the same thing. Paste some code,
let it ramble for a bit and see results. There's plenty of options available to
do this in a browser, but what about Node.js and other runtimes?

We have options `console.time()` and `performance.now()`, but there's some
boilerplate and ceremony involved to get results.

And we shouldn't have to worry about things like process isolation, state resets
between runs, external conditions, turbulence, and aggregating numbers to yield
statistically significant results.

For some more serious benchmarking, we'll need something better.

### Ecosystem

Node.js was pretty close to having a built-in `node:benchmark` module. In
November 2023, a pull request to [add an experimental `node:benchmark`][21]
module to Node.js core was opened. And closed, after an interesting debate.

For the record, Deno has a built-in [benchmark runner][22].

This leaves us with a number of packages for micro benchmarking in Node.js. The
most popular and promising packages for micro benchmarking include:

- [Benchmark.js][23]
- [Tinybench][24]
- [jsperf.dev][25]

Tools like [Benchmark.js][23] and [Tinybench][24] take care of some of the
(statistical) complexity and are invaluable tools in this space.

A CLI for such tools would be great, though. Have some code in a file and let a
CLI tool import and benchmark it. Much like aforementioned tools, but move the
API from runtime to CLI.

### Pitfalls

Before we continue, here's the mandatory warning to not forget about the
pitfalls of micro benchmarking:

- Running code in isolation means missing real-world context and different
  compiler optimizations. For various reasons, the same code may have different
  performance characteristics when running in the context of a real-world
  application.
- Micro benchmarking is often associated with premature optimization. Don't lose
  sight of the big picture!

### Example: string concatenation

Let's look at an example. We want to know which function is the fastest, and by
how much. The following functions do the same thing:

```ts
function join(strings) {
  return strings.join('');
}
```

```ts
function concat(strings) {
  return ''.concat(...strings);
}
```

### Benchmark.js

[Benchmark.js][23] is great and battle-tested software, despite the fact its
last publish was early 2017 when it was tested on Node.js version 10 and 11.

Let's create a test suite to benchmark and compare three string concatenation
alternatives:

```ts
import Benchmark from 'benchmark';

const strings = ['aa', 'bb', 'cc', 'dd', 'ee', 'ff', 'gg', 'hh'];

function plus(strings) {
  let result = '';
  for (const str of strings) result += str;
  return result;
}

function join(strings) {
  return strings.join('');
}

function concat(strings) {
  return ''.concat(...strings);
}

const suite = new Benchmark.Suite();

suite
  .add('plus', function () {
    plus(strings);
  })
  .add('join', function () {
    join(strings);
  })
  .add('concat', function () {
    concat(strings);
  })
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
```

Running this on my machine gives the following output:

```shell
$ node benchmark.mjs
plus x 20,171,223 ops/sec ±0.41% (94 runs sampled)
join x 10,288,969 ops/sec ±0.19% (101 runs sampled)
concat x 17,782,613 ops/sec ±0.18% (98 runs sampled)
Fastest is plus
```

Clear output. All options are fast, but we have a winner.

### Tinybench

Tinybench is the new kid on the block. You can use it stand-alone, and it also
comes [shipped with Vitest][26].

The API of Tinybench is similar to Benchmark.js:

```ts
import { Bench } from 'tinybench';

const suite = new Bench();

suite
  .add('plus', function () {
    plus(strings);
  })
  .add('join', function () {
    join(strings);
  })
  .add('concat', function () {
    concat(strings);
  });

suite.addEventListener('complete', function () {
  console.table(suite.table());
});

suite.run();
```

Running this gives the following output:

```shell
$ node tinybench.mjs
┌─────────┬───────────┬──────────────┬────────────────────┬──────────┬─────────┐
│ (index) │ Task Name │   ops/sec    │ Average Time (ns)  │  Margin  │ Samples │
├─────────┼───────────┼──────────────┼────────────────────┼──────────┼─────────┤
│    0    │  'plus'   │ '13,188,219' │  75.8252486995182  │ '±0.61%' │ 6594110 │
│    1    │  'join'   │ '7,958,935'  │ 125.64493939618565 │ '±0.54%' │ 3979468 │
│    2    │ 'concat'  │ '11,681,195' │ 85.60767506752819  │ '±0.91%' │ 5840598 │
└─────────┴───────────┴──────────────┴────────────────────┴──────────┴─────────┘
```

### A CLI, maybe?

Wouldn't it be convenient if we could just export our functions from a file:

```ts
const strings = ['aa', 'bb', 'cc', 'dd', 'ee', 'ff', 'gg', 'hh'];

export function plus(strings) {
  let result = '';
  for (const str of strings) result += str;
  return result;
}

export function join(strings) {
  return strings.join('');
}

export function concat(strings) {
  return ''.concat(...strings);
}
```

And point our imaginary `bench` CLI tool at this file:

```shell
$ bench string-concat.js
plus x 20,171,223 ops/sec ±0.41% (94 runs sampled)
join x 10,288,969 ops/sec ±0.19% (101 runs sampled)
concat x 17,782,613 ops/sec ±0.18% (98 runs sampled)
Fastest is plus
```

And, maybe, one day:

```shell
$ node --bench string-concat.js
```

## Conclusion

Although the building blocks are there, I think especially in the area of macro
optimizations there's room for tooling to make our lives easier.

This concludes my perspective on the current state of benchmarking in Node.js,
at the end of 2023. Do you agree?

[1]: #macro-benchmarking
[2]: #ecosystem
[3]: #example-performanceobserver-for-functions
[4]: #example-timerify-application-code
[5]: #micro-benchmarking
[6]: #ecosystem-1
[7]: #pitfalls
[8]: #example-string-concatenation
[9]: #benchmarkjs
[10]: #tinybench
[11]: #a-cli-maybe
[12]: #conclusion
[13]: https://nodejs.org/docs/latest/api/perf_hooks.html
[14]: https://www.npmjs.com/search?q=timerify
[15]: https://www.npmjs.com/search?q=PerformanceObserver
[16]: https://www.npmjs.com/search?q=perf_hooks
[17]: https://twitter.com/search?q=perf_hooks
[18]: https://nodejs.org/api/perf_hooks.html
[19]:
  https://github.com/webpro/knip/blob/main/packages/knip/src/util/Performance.ts
[20]: https://codesandbox.io/p/devbox/performance-observer-r5rrvx
[21]: https://github.com/nodejs/node/pull/50768
[22]: https://docs.deno.com/runtime/manual/tools/benchmarker
[23]: https://github.com/bestiejs/benchmark.js
[24]: https://github.com/tinylibs/tinybench
[25]: https://github.com/jsperfdev/jsperf.dev
[26]: https://vitest.dev/guide/features.html#benchmarking-experimental
