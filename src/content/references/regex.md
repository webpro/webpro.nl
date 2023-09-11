# Regular Expressions

Regex syntax I always need to look up.

## Lookaround

### Lookahead

Match something ahead of something else:

```js
const positive = /some(?=thing)/.test('something'); // true
const positive = /some(?=thing)/.test('someone'); // false
const negative = /some(?!thing)/.test('someone'); // true
const negative = /some(?!thing)/.test('something'); // false
```

### Lookbehind

Match something behind something else:

```js
const positive = /(?<=some)thing/.test('something'); // true
const positive = /(?<=some)thing/.test('anything'); // false
const negative = /(?<!some)thing/.test('anything'); // true
const negative = /(?<!some)thing/.test('something'); // false
```

The lookarounds themselves are not part of the match.
