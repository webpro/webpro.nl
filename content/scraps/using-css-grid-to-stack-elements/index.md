---
published: 2022-05-23
stylesheets: ./styles.css
description: A little CSS trick to stack elements without z-index
tags: CSS, stack, grid
---

# Using CSS Grid to Stack Elements

To stack elements using CSS, we previously had to turn to absolute positioning
and `z-index` tricks. Yet with CSS Grid, there's a new way to do this. To show
what I mean, we're going to build this example component:

:::section

:::div{.grid}

::div{.back}

:::div{.front}

What A Badge

:::

First, we need a few HTML elements:

```html
<div class="grid">
  <div class="back" />
  <div class="front">What A Badge</div>
</div>
```

The `.back` element could be an image or something more interesting. The
following style declarations show how to stack the `.back` and `.front` elements
on top of each other:

```css
.grid {
  display: grid;
  grid-template-rows: auto min-content 16px;
}

.back {
  grid-area: 1 / 1 / 4 / 2;
}

.front {
  grid-area: 2 / 1 / 3 / 2;
  margin: 0 -20px;
}
```

The trick is to use overlapping `grid-area` values for the elements you want to
stack. Use `grid-template-rows` (or `grid-template-columns`) to lay out the
elements. Additionally, you can use (negative) `margin` to position the stacked
element relative to the grid for even more flexibility.

The stacking order follows the order in the DOM: the last element will be on top
of the previous element(s).

The `min-content` value for the second row of the grid ensures the row takes the
height of the stacked `.front` element, while the `auto` value for the first row
makes it occupy the rest of the available space.

This idea is certainly not new. For instance, it was presented in [How to Stack
Elements in CSS][1]. This scrap presents the same idea in a more focused way,
and with a different example use case.

[Support for CSS Grid][2] is currently great across browsers, so you can go
ahead and use all of this today!

[1]: https://css-tricks.com/how-to-stack-elements-in-css/
[2]: https://caniuse.com/css-grid
