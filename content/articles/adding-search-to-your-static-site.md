---
draft: true
---

# Adding Search To Your Static Site

Static websites are popular nowadays. There are many static site generators, but
not all have search built-in. Recently I've added a static search option to a
few websites, including the one you're reading. In this article I would like to
share how I did this.

## MiniSearch

When searching to find a good library for static search, I came across popular
solutions such as [Lunr.js][1], [FlexSearch][2] and [Fuse.js][3]. To my
surprise, these libraries are not very well maintained actively anymore, while
they all have quite some open issues. To me, this does not relate to the
popularity of static websites in general. I've used Fuse.js before to implement
a simple but fast search engine (on [lejan.com.br][4]), but this was over a year
ago, and I'm always looking for better options. I've tried them all again, and
each still has a few minor glitches. Another reason is that both
[markdown-rambler][5] and this website itself use ES Modules and other modern
JavaScript features, which may always be good for developer experience,
maintenance and/or performance.

Later, I was lucky enough to find [MiniSearch][6] when [searching for "search
index"][7] in the npm registry. This package happens to be easy to use, while
performance and file size seem to be pretty good. To be honest, I didn't do an
actual file size and performance comparison between the various options, the
[MiniSearch blogpost][8] has a good overview.

The fuzzy search and prefix search are optional, and work very well for the
websites where I integrated it. This always requires a bit of fine-tuning,
depending on the size and density of documents. I did not try the
auto-suggestion feature yet.

## Getting Started

So, how to integrate MiniSearch in your static website? There are roughly four
steps here:

1.  [Build the index][9]
2.  [Serve the index][10] with the rest of the static site
3.  [Connect the index][11] with a DOM element (such as an input field)
4.  [Search and render results][12]

## Building The Index

Here's a fragment from markdown-rambler, but the concept can be applied in any
JavaScript build system. The idea is to map existing files or pages to be
indexed to an object containing the data necessary for both the index and the
fields to eventually be displayed in the search results.

In my experience so far, the contents of Markdown documents can be used just
fine as input for the index. The minimal syntax of Markdown does not seem to
negatively impact the index. This makes a solution like MiniSearch perfect for
static websites, as they are often powered by Markdown files.

The result (`documents`) can be provided to a `MiniSearch` instance using
`minisearch.addAll(documents)`, which creates and returns the actual index. The
final step here is to store this JSON file to disk:

```js
const documents = files
  .filter(files => file.type === 'article')
  .map((file, index) => ({
    id: index,
    title: file.data.meta.title,
    description: file.data.meta.description,
    pathname: file.data.meta.pathname,
    content: file.data.markdown,
  }));

const miniSearch = new MiniSearch({
  fields: ['title', 'content'],
  storeFields: ['title', 'pathname'],
});

await miniSearch.addAllAsync(documents);

await write('search-index.json', JSON.stringify(miniSearch.toJSON()));
```

This example uses only the `title` and `content` fields of each document to
index the full-text search.

## Serving The Index

Next step is to make sure the index is served with the rest of the static
website. This could be the root of the "dist" or "public" folder.

## Connecting the Search Component

Depending on the requirements and the type of (static) website, the next part
could be implemented in many ways. Here I'm going to try and keep it very
concise, and attach an event listener to an existing input field. Here it is an
existing `<input type="search">` in the DOM:

<!-- prettier-ignore -->
```js
(async () => {
  await import('https://cdn.jsdelivr.net/npm/minisearch@4.0.3/dist/umd/index.min.js');
  const searchIndex = await fetch('/search-index.json').then(response => response.text() );
  const index = MiniSearch.loadJSON(searchIndex, { fields: ['title', 'content'] });

  const input = document.querySelector('input[type=search]');

  const search = query => {
    const results = index.search(query, { prefix: true, fuzzy: 0.3 });
    console.log(results);
  };
  input.addEventListener('input', event => {
    search(event.target.value);
  });
})();
```

Here we already have the basics of our search component, in only a few lines of
code. Note that the indexed fields `title` and `content` should be provided
again when loading the index. For brevity, this example logs the search results
in the browser console. Combined with very little styling, this is everything
this website uses for the static search.

## Searching and Rendering Results

To render search results depends on the type of static website. For the sake of
completeness, here's a minimal example using vanilla JavaScript. This is an
extension of the `search` function connected to the `search` method of the
MiniSearch `index` instance:

<!-- prettier-ignore -->
```js
const container = document.createElement('div');
container.setAttribute('id', 'search-results');

const search = query => {
  if (query.length > 1) {
    const results = index.search(query, { prefix: true, fuzzy: 0.3, });
    const list = document.createElement('ol');
    results.slice(0, 10).forEach(result => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.setAttribute('href', result.pathname);
      link.appendChild(document.createTextNode(result.title));
      item.appendChild(link);
      list.append(item);
    });
    container.replaceChildren(list);
    input.after(container);
  } else {
    container.parentNode.removeChild(container);
  }
};
```

This code is used on this website and appends a container element to the DOM as
a sibling of the search component. This way, it can be styled relative to this
input field.

The search results are appended the container element as an ordered list.
Ordered, since MiniSearch provides the results sorted by relevance score.

## Next Steps

The search index is a relatively large static asset. Loading this file on page
load, as shown above, could degrade the performance of your website. It does not
block the main render thread as it uses a dynamic import, but for larger
websites this may impact overall performance. One way to mitigate this is to
only load the index when the user actually uses the search, for instance on the
`focus` event of the input field. To get an idea, currently the index of this
website with its first 11 articles, the size is 113Kb uncompressed, and 20Kb
gzipped. This is generally not really an issue, but definitely something to keep
an eye on when a website is large or growing. After the first load, the browser
will cache the static search index on subsequent page loads.

Depending of the site contents, another interesting feature might be to create
multiple indices. This would be straight-forward following the steps in this
article.

[1]: https://github.com/olivernn/lunr.js
[2]: https://github.com/nextapps-de/flexsearch
[3]: https://github.com/krisk/fuse
[4]: https://www.lejan.com.br
[5]: https://github.com/webpro/markdown-rambler
[6]: https://github.com/lucaong/minisearch
[7]: https://www.npmjs.com/search?q=search%20index
[8]:
  https://lucaongaro.eu/blog/2019/01/30/minisearch-client-side-fulltext-search-engine.html
[9]: #building-the-index
[10]: #serving-the-index
[11]: #connecting-the-search-component
[12]: #searching-and-rendering-results
