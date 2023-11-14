---
published: 2014-01-24
modified: 2022-02-26
description: Wrap like an Egyptian
---

# The $ object demystified

## Wrap Like An Egyptian

Let's take a quick look at querySelector-based libraries such as jQuery and
Zepto. You're probably familiar with their syntax:

```js
var $items = $('.items');
```

Once you've queried some elements, there's a lot you can do with those elements,
such as adding classes (e.g. `$el.addClass('active')`), insert other elements,
add event listeners, and so on.

## Elements vs. API

The elements being returned from the the call to `$(selector)` represent an
array of matching DOM elements, while the API methods that come with them are
properties to an object. To combine them, it might seem ideal if any array of
elements would have its `prototype` set to the API object. The API prototype
object could then be shared across each wrapped object, which would be very
efficient. However, we can't just set the `prototype` of an array (and it's not
a good idea to extend that prototype directly with a bunch of mostly unrelated
methods). So how could this wrapping of things be implemented?

## Implementation options

This leaves us with a couple of less optimal options. For example:

1. Use the array and assign all members of the API as properties to the array.
2. Use the array and set its `__proto__` member to the API object.
3. Use `Object.create()`, and assign all DOM elements as indexed members to the
   object.
4. Use a constructor and use the API object as its `prototype`. Assign all DOM
   elements as indexed members to the object.

Here's a basic, untested implementation of each:

1. Array with iteration over API methods

```js
function $(selector) {
  var collection = document.querySelectorAll(selector),
    wrapped = [].slice.call(collection);
  for (var method in MyAPI) {
    wrapped[method] = MyAPI[method];
  }
  return wrapped;
}
var $myCollection = $('.items');
```

2. Array with `__proto__`

```js
function $(selector) {
  var collection = document.querySelectorAll(selector),
    wrapped = [].slice.call(collection);
  wrapped.__proto___ = MyAPI;
  return wrapped;
}
var $myCollection = $('.items');
```

3. `Object.create` with iteration over elements

```js
function $(selector) {
  var collection = document.querySelectorAll(selector),
    wrapped = Object.create(MyAPI);
  for (var i = 0, l = collection.length; i < l; i++) {
    wrapped[i] = collection[i];
  }
  return wrapped;
}
var $myCollection = $('.items');
```

4. Constructor with iteration over elements

```js
function $(selector) {
  var collection = document.querySelectorAll(selector);
  for (var i = 0, l = collection.length; i < l; i++) {
    this[i] = collection[i];
  }
}
$.prototype = MyAPI;
var $myCollection = new $('.items');
```

Each of the options require an iteration over either the elements or the API
members. That's exactly why they're less optimal options. Depending on the
length of either the elements or the API, this might end up expensive. But
that's not even mentioning that it's generally considered bad practice to either
augment an object with array members, or vice-versa.

## jQuery and Zepto

How are the big guys doing it? Basically, jQuery follows strategy #4, while
Zepto uses the `__proto__` (#2).

## `Object.__proto__`

Let's consider the `__proto__` strategy for a moment. Since an array is also an
object in JavaScript, it makes sense to use `Object.prototype.__proto__` (or
ES6's upcoming `Object.setPrototypeOf`). And it actually works in most browsers,
_except for Internet Explorer IE10 and below_. Another downside is that it isn't
fast, especially when combined with the obligatory Array conversion
(`Array.slice` or iteration). Because in more real-world scenario, array-like
collections such as `NodeList` and `ElementList` should be converted to static
collections, as having live `NodeLists` might lead to unexpected behavior. So
you'd still need the iteration.

## Performance

During a bit of isolated benchmarking, this gives interesting and wildly varying
results across browsers and number of elements. Actually setting the `__proto__`
itself makes the strategy to be performing slightly worse than the others.

## Wrapping up

In most situations I would go with the constructor approach, while making an
iteration over the array of elements (#4). This is a safe option with regards to
browser support, works everywhere today and tomorrow, and in my benchmarking
came out performing very well across browsers. jQuery essentially does the same
thing, and it's also what I ended up doing myself in DOMtastic.

Feel free to check out the [DOMtastic][1] project if you'd like to see code, run
benchmarks, and/or see their results.

## Related resources

- [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/proto][2]
- [https://github.com/jquery/jquery/blob/master/src/core/init.js][3]
- [https://github.com/webpro/DOMtastic/blob/master/src/selector/index.js][4]
- [https://github.com/madrobby/zepto/blob/master/src/zepto.js][5]
- [https://github.com/madrobby/zepto/issues/272][6]

[1]: https://github.com/webpro/DOMtastic
[2]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/proto
[3]: https://github.com/jquery/jquery/blob/master/src/core/init.js
[4]: https://github.com/webpro/DOMtastic/blob/master/src/selector/index.js
[5]: https://github.com/madrobby/zepto/blob/master/src/zepto.js
[6]: https://github.com/madrobby/zepto/issues/272
