import { html } from 'markdown-rambler';

/**
 * @typedef {import('markdown-rambler').Meta} Meta
 */

const feed = html`<a href="/blog/feed.xml">
  <svg>
    <title>RSS feed</title>
    <use href="/img/sprites.svg#rss"></use>
  </svg>
</a>`;
const github = html`<a href="https://github.com/webpro/webpro.nl">
  <svg>
    <title>GitHub</title>
    <use href="/img/sprites.svg#github"></use>
  </svg>
</a>`;
const twitter = html`<a href="https://twitter.com/webprolific">
  <svg>
    <title>Twitter</title>
    <use href="/img/sprites.svg#twitter"></use>
  </svg>
</a>`;

/** @type {(meta: Meta) => ReturnType<typeof html>} */
const footer = meta => {
  switch (meta.type) {
    case 'blog':
      return html`<p class="icons">${feed}${github}${twitter}</p>`;
    case 'article':
      return html`<p class="icons">${feed}${github}${twitter}</p>
        <p>Do you have a question or did you find an issue in this article?</p>
        <p>
          <a href="https://github.com/webpro/webpro.nl">Please let me know!</a> This website is fully open-sourced at
          GitHub.
        </p>`;
    default:
      return html``;
  }
};

/**  @type {import('markdown-rambler').Meta['layout']} */
export default (node, meta) => {
  const { logo } = meta;
  return html`
    <header>
      <div class="logo">
        <a href="${logo.href}" title="Go back">
          <img src="${logo.src}" width="32" height="32" alt="${logo.alt}" />
        </a>
      </div>
      <input type="search" id="search" placeholder="Search..." autocomplete="off" />
      <label class="theme-switch" for="theme-toggle">
        <button type="button" id="theme-toggle" role="switch" aria-label="Switch color theme" aria-checked="false" />
      </label>
    </header>
    <main ${meta.class ? `class=${meta.class}` : ''}>${node}</main>
    <footer>${footer(meta)}</footer>
  `;
};
