import { html } from 'markdown-rambler';

const feed = html`<a href="/blog/feed.xml">
  <svg><use href="/img/sprites.svg#rss"></use></svg>
</a>`;
const github = html`<a href="https://github.com/webpro/webpro.nl">
  <svg><use href="/img/sprites.svg#github"></use></svg>
</a>`;
const twitter = html`<a href="https://twitter.com/webprolific">
  <svg><use href="/img/sprites.svg#twitter"></use></svg>
</a>`;

const footer = meta => {
  switch (meta.type) {
    case 'blog':
      return html`<p class="icons">${feed}${github}${twitter}</p>`;
    case 'article':
      return html`<p class="icons">${feed}${github}${twitter}</p>
        <p>Do yo have a question or did you find an issue in this article?</p>
        <p>
          <a href="https://github.com/webpro/webpro.nl">Please let me know!</a> This website is fully open-sourced at
          GitHub.
        </p>`;
    default:
      return '';
  }
};

export default (node, meta) => {
  const { logo } = meta;
  return html`
    <header>
      <div class="logo">
        <a href="${logo.href}" title="Go to homepage">
          <img src="${logo.src}" width="32" height="32" alt="${logo.alt}" />
        </a>
      </div>
      <label class="theme-switch" for="theme-toggle">
        <button type="button" id="theme-toggle" role="switch" aria-label="Switch color theme" aria-checked="false" />
      </label>
    </header>
    <main ${meta.class ? `class=${meta.class}` : ''}>${node}</main>
    <footer>${footer(meta)}</footer>
  `;
};
