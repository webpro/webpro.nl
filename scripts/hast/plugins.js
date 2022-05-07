import { h } from 'hastscript';
import { SKIP } from 'unist-util-visit';
import { findElement, append, insertBeforeStylesheets } from 'markdown-rambler';
import { f } from '../helpers.js';

/**
 * @typedef {import('unified').Pluggable} Pluggable
 * @typedef {import('hast').Root} Root
 * @typedef {import('markdown-rambler').Meta} Meta
 */

/**
 * @template T
 * @typedef {import('unified').Plugin<[T], Root>} Plugin<T>
 */

/**
 * @type {Plugin<Meta>}
 */
export const enrichArticleHeading = meta => tree => {
  if (meta.type === 'article' || meta.type === 'scrap') {
    const {
      author: { name, href },
      published,
    } = meta;
    findElement(tree, 'h1', (node, index, parent) => {
      const sub = h('div', { class: 'meta' }, [
        'Published by ',
        h('a', { href }, name),
        ' on ',
        published ? f.long(published) : '',
      ]);
      const header = h('header', node, sub);
      const content = parent.children.slice(index + 1);
      parent.children = [header, ...content];
      return false;
    });
  }
  return tree;
};

/**
 * @type {Pluggable}
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
 * @type {Pluggable}
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
 * @type {Pluggable}
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
