---
published: 2014-01-21
modified: 2022-02-26
description: Bubbling events in detached DOM trees
---

# Bubbling events in detached DOM trees

Here's a quick post on the topic. Sometimes we need events to still work in a
detached DOM tree. Even though the end-user can't really interact with detached
trees, DOM elements in that tree can still listen to other events and react to
them. This might also be efficient performance-wise, since changes in detached
trees don't trigger repaints.

## Detached DOM trees

We'll talk about how to support events in detached DOM trees, and how to do this
in a performant way. First, a detached DOM tree is an HTML fragment that's not
in the current document (e.g. you won't find it in the Element Inspector of your
debugger), but it's still referenced in memory. Use cases where they come in
useful include:

- Fragments that were just rendered with a template engine, and ready to be
  inserted to the DOM.
- Fragments that are attached and detached to minimize repaints while their DOM
  structure is modified.
- Fragments that act as fixtures or sandboxes during tests.

In any of these situations, it can be very helpful if events would be able to
bubble up, even though it's not attached to the document yet.

What most libraries do is either not support this at all, or not in the most
optimal way. For example, Zepto does not support it, and jQuery does something
similar to what I usually see:

```js
while (element.parentNode) {
  element.dispatchEvent(event);
  element = element.parentNode;
}
```

This might work for either attached or detached DOM trees: just dispatch the
event on each ancestor of the targeted element (often by calling the "trigger"
method).

However, wouldn't it be better if we let the browser do all the work, and just
let the event bubble up the tree (while dispatching only a single event without
traversing the tree)?

## Detect support

Here's a way to detect if a browser supports bubbling events in detached DOM
trees:

```js
var isEventBubblingInDetachedTree = (function (global) {
  var isBubbling = false;
  var doc = global.document;
  if (doc) {
    var parent = doc.createElement('div'),
      child = parent.cloneNode();
    parent.appendChild(child);
    parent.addEventListener('e', function () {
      isBubbling = true;
    });
    child.dispatchEvent(new CustomEvent('e', { bubbles: true }));
  }
  return isBubbling;
})(this);
```

In a browser that supports this, dispatching the event is enough to have the
event bubble up. Currently, at least in IE10, IE11 and Firefox you can take
advantage of this.

In other browsers, you still need to dispatch the event on each element in the
ancestor chain. Here's a snippet to demonstrate what this might look like:

```js
if (
  !params.bubbles ||
  isEventBubblingInDetachedTree ||
  isAttachedToDocument(element)
) {
  element.dispatchEvent(event);
} else {
  triggerForPath(element, type, params);
}
```

I think this code is quite self-explanatory. See DOMtastic's [event
implementation][1] for an extended example.

## Wrapping up

Bubbling events might not be your biggest (performance) issue, but I think it's
good to know how to deal with them anyway. Including situations where you're not
using jQuery to handle this for you.

[1]: https://github.com/webpro/DOMtastic/blob/master/src/event/trigger.js
