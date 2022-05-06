---
published: 2022-05-06
---

# The JavaScript block statement

In the first scrap of this blog I'd like to make a case for a great little
feature that I rarely see used in the wild.

- Want to organize your code a little bit better?
- Have a hard time coming up with another name for the same variable?

Use blocks! Let's take a bogus unit test:

```javascript
function test() {
  const type = 'some';

  const thing = getThing(type, 1);
  assert.equal(thing, 1);

  // Ehm... how to call this `thing` now...?
  const thing2 = getThing(type, 2);
  assert.equal(thing2, 2);
}
```

Specifically for unit tests you could argue that this particular case should be
separated in two unit tests, but sometimes that's just not what you want. You
can use blocks instead:

```javascript
function test() {
  const type = 'some';

  {
    const thing = getThing(type, 1);
    assert.equal(thing, 1);
  }

  {
    const thing = getThing(type, 2);
    assert.equal(thing, 2);
  }
}
```

Neat!
