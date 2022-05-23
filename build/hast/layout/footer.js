import { html } from 'markdown-rambler';

/**
 * @typedef {import('markdown-rambler').Meta} Meta
 */

const feed = html`<a href="/blog/feed.xml" title="Frontend Ramblings RSS feed">
  <svg>
    <title>Frontend Ramblings RSS feed</title>
    <use href="/img/sprites.svg#rss"></use>
  </svg>
</a>`;

const github = html`<a href="https://github.com/webpro/webpro.nl" title="The content of this website on GitHub">
  <svg>
    <title>The content of this website on GitHub</title>
    <use href="/img/sprites.svg#github"></use>
  </svg>
</a>`;

const twitter = html`<a href="https://twitter.com/webprolific" title="Me on Twitter">
  <svg>
    <title>Me on Twitter</title>
    <use href="/img/sprites.svg#twitter"></use>
  </svg>
</a>`;

const shareTwitter = (url, text) => {
  const query = new URLSearchParams();
  query.set('url', url);
  query.set('text', text);
  const href = new URL('/intent/tweet', 'https://twitter.com');
  href.search = query.toString();

  return html`<a href=${href} title="Share this article on Twitter">
    <svg>
      <title>Share this article on Twitter</title>
      <use href="/img/sprites.svg#share"></use>
    </svg>
  </a>`;
};

const shareHackerNews = (url, text) => {
  const query = new URLSearchParams();
  query.set('u', url);
  // query.set('t', text); // Spaces eventually become plus signs (+) in the input field
  const href = new URL('/submitlink', 'https://news.ycombinator.com');
  href.search = query.toString() + '&t=' + text;

  return html`<a href=${href} title="Share this article on Twitter">
    <svg>
      <title>Share this article on Hacker News</title>
      <use href="/img/sprites.svg#hacker-news"></use>
    </svg>
  </a>`;
};

/** @type {(meta: Meta) => ReturnType<typeof html>} */
export const footer = meta => {
  const blogLinks = [feed, github, twitter];

  switch (meta.type) {
    case 'blog':
      return html`<p class="icons">${blogLinks}</p>`;
    case 'article':
    case 'scrap': {
      const links = [...blogLinks, shareTwitter(meta.href, meta.title), shareHackerNews(meta.href, meta.title)];
      return html`<p class="icons">${links}</p>
        <p>Do you have a question or did you find an issue in this article?</p>
        <p>
          <a href="https://github.com/webpro/webpro.nl">Please let me know!</a> This website is fully open-sourced at
          GitHub.
        </p>`;
    }
    default:
      return html``;
  }
};
