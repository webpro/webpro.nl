---
published: 2015-03-24
modified: 2022-02-26
description: A short guide about why and how to use SVG sprites
---

# Why and how I'm using SVG sprites over fonts for icons

In a recent project, I've been doing some research and testing to find the best
solution for icons and small images in a web application.

The requirements included support for customization of both the background and
the font color of the application. Obviously, crisp images and performance are
important as well.

After trying a bit and reading up on some related articles, I came to the
conclusion I wanted to go for SVG sprites, instead of an icon font. Some of the
main advantages of SVG over an icon font include:

- Slightly more control when styling SVG elements, since fonts are text.
- Fonts might be less crisp due to anti-aliasing, or off by half a pixel.
- Less trickery to make it work cross-browser.
- It's easier to change SVG shapes.

It's a bummer that, given the requirements, we couldn't use SVG sprites in CSS
as background images. The reason being that you can't change the fill color
dynamically when the background image is set.

So, we need to resort to inline SVG images. One way is to simply use inline
`<svg>` elements in the HTML, but this means duplication of potentially quite
some SVG images in the page. Fortunately, there is a great way to reuse shapes
from a single SVG file across the page!

The single SVG sprite file (say, "defs.svg") looks like this:

```xml
<svg display="none" width="0" height="0" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <symbol id="icon-delete" viewBox="0 0 1024 1024">
            <title>delete</title>
            <path class="path1" d="M810.667 273.707l..."></path>
        </symbol>
        <symbol id="icon-info" viewBox="0 0 1024 1024">
            <title>info</title>
            <path class="path1" d="M448 304c0-26.4..."></path>
            <path class="path2" d="M640 768h-256v..."></path>
            <path class="path3" d="M512 0c-282.77..."></path>
        </symbol>
        <symbol id="icon-arrow-left" viewBox="0 0 1024 1024">
            <title>arrow-left</title>
            <path class="path1" d="M1024 512c0-282.752..."></path>
        </symbol>
    </defs>
</svg>
```

Note that I've cut off some path definitions for brevity.

You can use a service like the [IcoMoon App][1] and/or create custom icons using
e.g. Illustrator. Then paste the SVG shapes (`<path>`, `<polygon>`, `<rect>`,
`<circle>`, etc.) into a `<symbol>` as shown in this SVG sprite.

Now in the HTML, use `<svg>` images like so:

```xml
<svg role="img" title="delete">
    <use xlink:href="defs.svg#icon-delete"></use>
</svg>
```

This results in the browser downloading the file once, and using a cached
instance afterwards. We need only a little bit of styling as a basis:

```css
svg {
  background-color: transparent;
  fill: currentColor;
  width: 24px;
  height: 24px;
}
```

Now we are able to set font and background colors in any way we want!

The good thing is that this works great in most browsers. We only need to inject
[SVG for Everybody][2] into our page to support Internet Explorer. I've tried it
down to IE9, but there's even support for IE6–8. The script is only 1KB
minified, and leaves the other browsers unharmed.

The maintenance process isn't perfect, as we need to manually edit the sprite
file, but I'm still happy with it. It shouldn't be hard to write a script that
concatenates a bunch of SVG files into one sprite, though. See for example
[svg-sprite-generator][3].

Happy styling!

Resources:

- [https://css-tricks.com/icon-fonts-vs-svg/][4]
- [https://css-tricks.com/svg-use-external-source/][5]
- [http://ianfeather.co.uk/ten-reasons-we-switched-from-an-icon-font-to-svg/][6]
- [https://github.com/jonathantneal/svg4everybody][2]
- [https://github.com/frexy/svg-sprite-generator][3]

[1]: https://icomoon.io/app
[2]: https://github.com/jonathantneal/svg4everybody
[3]: https://github.com/frexy/svg-sprite-generator
[4]: https://css-tricks.com/icon-fonts-vs-svg/
[5]: https://css-tricks.com/svg-use-external-source/
[6]: http://ianfeather.co.uk/ten-reasons-we-switched-from-an-icon-font-to-svg/
