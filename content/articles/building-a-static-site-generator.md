---
draft: true
---

# Building A Static Site Generator

When I wanted to write documentation with as little friction as possible,
Markdown was an easy choice for me. However, when looking around for a solution
to transform this into a nice looking website, I could not really find something
I liked. Solutions like [GitBook][1], [Docusaurus][2] or [docsify][3] didn't
really suit me for a variety of reasons. It often comes down to such solutions
being pretty opinionated and I... have opinions too. See for yourself, you might
agree such solutions are fairly bloated in their offerings.

What I was really looking for was a clean way to write Markdown, maybe with a
few extensions such as tables, and apply some CSS to the resulting HTML.

Then I stumbled upon [remark][4]. It turned out to be part of a large collection
of Markdown parsers, plugins, compilers, etc. This made me consider another
perspective: start out with a minimalistic approach by only turning Markdown
into HTML. It was a bit of fiddling, searching, and trial & error, but it did
give me the flexibility and power to create just what I wanted.

Let's look at the very first version. What follows is the initial commit of the
documentation build script. There's a lot to decipher here, we will break it
down afterwards. But here's the gist:

1.  Find all documentation-related files
2.  Run `*.md` through the Markdown converter, and simply copy everything else
3.  The converter is a chain of middleware operating on ASTs, more on that
    later.

And here's the code:

```ts
import fs from 'node:fs';
import path from 'node:path';
import glob from 'globby';
import unified from 'unified';
import parse from 'remark-parse';
import gfm from 'remark-gfm';
import github from 'remark-github';
import remark2rehype from 'remark-rehype';
import doc from 'rehype-document';
import format from 'rehype-format';
import stringify from 'rehype-stringify';
import slug from 'rehype-slug';
import urls from 'rehype-urls';

function fixMarkdownLinks(url) {
  if (url.href.endsWith('.md')) {
    return url.href.replace(/\.md$/, '.html');
  } else if (url.href.includes('.md#')) {
    return url.href.replace(/\.md#/, '.html#');
  }
}

const files = await glob(['README.md', 'docs/**/*.*']);
const outputDir = path.join('dist', 'docs');

const convert = unified()
  .use(parse)
  .use(gfm)
  .use(github)
  .use(remark2rehype)
  .use(doc)
  .use(format)
  .use(stringify)
  .use(slug)
  .use(urls, fixMarkdownLinks);

files.forEach(file => {
  if (file.endsWith('.md')) {
    convert.process(fs.readFileSync(file), function (err, vFile) {
      if (err) console.error(err);
      const filename = file.endsWith('README.md')
        ? 'index.html'
        : file.replace(/\.md$/, '.html');
      const target = path.join(outputDir, filename);
      const dir = path.dirname(target);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(target, vFile.contents);
      console.log(`Converted ${target}`);
    });
  } else {
    const target = path.join(outputDir, file);
    fs.copyFileSync(file, target);
    console.log(`Copied ${target}`);
  }
});
```

Let's talk about some pieces of code.

```ts
const convert = unified().use(parse).use(remark2rehype).use(doc).use(stringify);

convert.process(fs.readFileSync(file), function (err, vFile) {
  const filename = file.replace(/\.md$/, '.html');
  fs.writeFileSync(target, vFile.contents);
});
```

Let's break down what we have here in this chain of plugins:

The `parse` plugin is a parser to read the Markdown source and turn this into a
so-called `mdast`, a Markdown AST. AST stands for Abstract Syntax Tree. The
remark ecosystem is all about `remark-*` plugins that operate on this `mdast`.

The `remark2rehype` plugin is a compiler to transform the `mdast` to `hast`, the
HTML AST. The rehype ecosystem has many `rehype-*` plugins to work on the
`hast`.

The `doc` plugin to wrap the content in an HTML document with `<head>` and
`<body>` elements.

Finally, the `stringify` plugin to create an HTML string from the `hast`.

Note that the order matters. Remark plugins should come before the "bridge" to
transform the Markdown AST, and Rehype plugins to transform the HTML AST should
be added after.

What makes the whole Unified ecosystem so interesting, is that you could also
read in HTML documents and apply transforms to them, or even convert HTML back
to Markdown.

There are many readily available plugins in the Unified universe, which will
suit many of your needs. However, operating on the AST will open up countless
possibilities to transform and enrich documents. The ability to modify a syntax
tree means you could extend Markdown with new syntax, or wrap elements with
other elements, add new attributes, and so on.

It does take a little getting into it, but when you've seen a few examples I'm
sure you can tweak them any way you like. Plugins are often based on "visitors",
an efficient way to modify the AST. The visitor is a function that is executed
on all nodes in the tree, and you can specificy which ones exactly to operate
on. Let's look at an example:

```ts
import visit from 'unist-util-visit';

export const removeDocumentTitle = () => tree => {
  visit(tree, 'heading', (node, index, parent) => {
    if (node.depth === 1) {
      parent?.children.splice(index, 1);
      return false;
    }
  });
};
```

This is an `mdast` plugin with a visitor that operates on all `heading`
elements, and removes the first `heading` with a `depth === 1`, which is the
title of the document. Why would we want to do this? Imagine a blog which
features an XML RSS feed. We can build an XML AST for this, in which we want the
content of each article to not contain the first header (as an RSS item should
have a title already in a separate field).

[1]: https://www.gitbook.com
[2]: https://docusaurus.io
[3]: https://docsify.js.org
[4]: https://remark.js.org
