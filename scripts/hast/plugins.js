import { h } from 'hastscript';
import { SKIP } from 'unist-util-visit';
import { findElement, append, insertBefore, insertBeforeStylesheets } from './std-helpers.js';
import { f } from '../helpers.js';

/**
 * @typedef {import('unified').Plugin<[] | Array<void>, Root>} PluginWithoutOptions
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').ElementContent} ElementContent
 * @typedef {import('../types').Meta} Meta
 */

/**
 * @template T
 * @typedef {import('unified').Plugin<[T], Root>} Plugin<T>
 */

/**
 * @type {Plugin<{ logo: import('../types').Logo }>}
 */
export const addPageHeader =
  ({ logo: { src, href, alt } }) =>
  tree => {
    const logo = h('img', { src, width: 32, height: 32, alt });
    const link = h('a', { href, title: 'Go to homepage' }, [logo]);
    const div = h('div', { class: 'logo' }, [link]);
    const label = 'Switch color theme';
    const id = 'theme-toggle';
    const toggle = h('button', { type: 'button', id, role: 'switch', 'aria-label': label, 'aria-checked': 'false' });
    const switch_ = h('label', { class: 'theme-switch', for: id }, [toggle]);
    const header = h('header', [div, switch_]);
    return insertBefore(tree, 'main', header);
  };

/**
 * @type {Plugin<{ meta: Meta }>}
 */
export const enrichArticleHeading =
  ({ meta }) =>
  tree => {
    if (meta.type === 'article') {
      const {
        author: { name, href },
        published,
      } = meta;
      findElement(tree, 'h1', (node, index, parent) => {
        const sub = h('div', { class: 'meta' }, ['Published by ', h('a', { href }, name), ' on ', f.long(published)]);
        const header = h('header', node, sub);
        const content = parent.children.slice(index + 1);
        parent.children = [header, ...content];
        return false;
      });
    }
    return tree;
  };

/**
 * @param {string} id
 */
const useSprite = id => {
  const href = `/img/sprites.svg#${id}`;
  return h('svg', [h('use', { href })]);
};

/**
 * @type {PluginWithoutOptions}
 */
export const convertSprites = () => tree => {
  findElement(tree, 'img', (node, index, parent) => {
    const src = node?.properties?.src;
    if (String(src).match(/\.svg#/)) {
      parent.children[index] = h('svg', [h('use', { href: src })]);
      return SKIP;
    }
  });
  return tree;
};

/**
 * @type {Plugin<{ type: 'page' | 'index' | 'article' }>}
 */
export const addPageFooter =
  ({ type }) =>
  tree => {
    const rss = h('a', { href: '/blog/feed.xml' }, [useSprite('rss')]);
    const source = h('a', { href: 'https://github.com/webpro/webpro.nl' }, [useSprite('github')]);
    const twitter = h('a', { href: 'https://twitter.com/webprolific' }, [useSprite('twitter')]);

    const indexIcons = h('p', { class: 'icons' }, [rss, source, twitter]);
    const articleIcons = h('p', { class: 'icons' }, [rss, source, twitter]);

    const feedback = [
      h('p', 'Do yo have a question or did you find an issue in this article?'),
      h('p', [
        h('a', { href: 'https://github.com/webpro/webpro.nl' }, 'Please let me know!'),
        ' This website is fully open-sourced at GitHub.',
      ]),
    ];
    const content = {
      article: [articleIcons, feedback],
      index: [indexIcons],
      page: [],
    };
    const footer = h('footer', content[type]);
    return append(tree, 'body', footer);
  };

/**
 * @type {PluginWithoutOptions}
 */
export const addBootScript = () => tree => {
  const inlineScript = `(() => {
    const theme = localStorage.getItem('theme');
    if (theme) document.documentElement.classList.add(theme);
  })();`;
  const script = h('script', inlineScript);
  return insertBeforeStylesheets(tree, script);
};

/**
 * @type {PluginWithoutOptions}
 */
export const addSimpleAnalytics = () => tree => {
  const img = h('img', {
    src: 'https://smplnltcs.webpro.nl/noscript.gif',
    alt: '',
    referrerpolicy: 'no-referrer-when-downgrade',
  });
  const noscript = h('noscript', [img]);
  const script = h('script', { async: true, defer: true, src: 'https://smplnltcs.webpro.nl/latest.js' });
  return append(tree, 'body', script, noscript);
};
