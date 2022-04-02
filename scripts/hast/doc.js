import { f } from '../helpers.js';
import { HOST, LOGO_SVG, STYLESHEETS, BLOG_RSS_PATHNAME } from '../constants.js';

/**
 * @typedef { import("../types").Meta } Meta
 */

/**
 * @param {Meta} meta
 * @returns {Array<{name?: string; content?: string, property?: string;}>}
 */
export const getMetaTags = meta => {
  const tags = [
    { name: 'author', content: meta.author.name },
    { name: 'description', property: 'og:description', content: meta.description },
    { name: 'twitter:description', content: meta.description },
    { property: 'og:url', content: meta.href },
    { name: 'twitter:title', property: 'og:title', content: meta.title },
    { name: 'twitter:image', property: 'og:image', content: HOST + meta.image },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@webprolific' },
    { name: 'twitter:creator', content: '@webprolific' },
    { name: 'twitter:image:alt', content: meta.title },
  ];
  switch (meta.type) {
    case 'page':
      tags.push({ property: 'og:site_name', content: 'WebPro' });
      tags.push({ property: 'og:type', content: 'website' });
      break;
    case 'index':
      tags.push({ property: 'og:site_name', content: 'WebPro Blog' });
      tags.push({ property: 'og:type', content: 'website' });
      break;
    case 'article':
      tags.push({ property: 'og:site_name', content: 'WebPro Blog' });
      tags.push({ property: 'og:type', content: 'article' });
      tags.push({ property: 'article:published_time', content: f.iso(meta.published) });
      if (meta.modified) tags.push({ property: 'article:modified_time', content: f.iso(meta.modified) });
      break;
  }
  return tags;
};

/**
 * @param {Meta} meta
 * @returns {Array<{rel: string; href?: string, type?: string; sizes?: string; title?: string}>}
 */
export const getLinks = meta => {
  return [
    { rel: 'canonical', href: meta.href },
    ...STYLESHEETS.map(href => ({ rel: 'stylesheet', href })),
    { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
    { rel: 'icon', href: HOST + LOGO_SVG, type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    { rel: 'manifest', href: '/manifest.json' },
    {
      rel: 'alternate',
      type: 'application/rss+xml',
      href: HOST + BLOG_RSS_PATHNAME,
      title: 'WebPro Blog RSS Feed',
    },
    { rel: 'prefetch', href: meta.prefetch },
  ];
};
