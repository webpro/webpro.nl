import { h } from 'hastscript';
import { visit } from 'unist-util-visit';
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
 * @param {Root} tree
 * @param {string} tagName
 * @param {...ElementContent} elements
 * @returns {Root}
 */
const append = (tree, tagName, ...elements) => {
  visit(tree, 'element', node => {
    if (node.tagName === tagName) {
      node.children.push(...elements);
      return false;
    }
  });
  return tree;
};

/**
 * @param {Root} tree
 * @param {string} tagName
 * @param {ElementContent} element
 * @returns {Root}
 */
const insertBefore = (tree, tagName, element) => {
  visit(tree, 'element', (node, index, parent) => {
    if (node.tagName === tagName) {
      parent?.children.unshift(element);
      return false;
    }
  });
  return tree;
};

/**
 * @param {Root} tree
 * @param {ElementContent} element
 * @returns {Root}
 */
const insertBeforeStylesheets = (tree, element) => {
  visit(tree, 'element', (node, index, parent) => {
    if (node.tagName === 'link' && node?.properties?.rel?.includes('stylesheet')) {
      parent?.children.splice(index, 0, element);
      return false;
    }
  });
  return tree;
};

/**
 * @type {Plugin<{ type: string; content: string }>}
 */
export const addInlineScript =
  ({ type, content }) =>
  tree => {
    const script = h('script', { type }, content);
    return append(tree, 'body', script);
  };

/**
 * @type {Plugin<{ page: import('../types').Page; article: import('../types').Article; }>}
 */
export const enrichArticleHeading =
  ({ page, article }) =>
  tree => {
    const {
      author: { name, href },
      published,
    } = article;
    if (page.type === 'article') {
      visit(tree, 'element', (node, index, parent) => {
        if (node.tagName === 'h1') {
          const sub = h('div', { class: 'meta' }, ['Published by ', h('a', { href }, name), ' on ', f.long(published)]);
          const header = h('header', node, sub);
          const content = parent.children.slice(index + 1);
          parent.children = [header, ...content];
          return false;
        }
      });
    }
    return tree;
  };

/**
 * @type {Plugin<{ logo: import('../types').Logo }>}
 */
export const addPageHeader =
  ({ logo: { src, href, alt } }) =>
  tree => {
    const logo = h('img', { src, width: 32, height: 32, alt });
    const link = h('a', { href, title: 'Go to homepage' }, [logo]);
    const div = h('div', { class: 'logo' }, [link]);
    const toggle = h('button', { type: 'button', id: 'theme-toggle', role: 'switch', 'aria-checked': 'false' });
    const switch_ = h('label', { class: 'theme-switch', for: 'theme-toggle' }, [toggle]);
    const header = h('header', [div, switch_]);
    return insertBefore(tree, 'main', header);
  };

/**
 * @type {Plugin<{ type: 'page' | 'index' | 'article' }>}
 */
export const addPageFooter =
  ({ type }) =>
  tree => {
    const text =
      type === 'article'
        ? [
            h('p', 'Do yo have a question or did you find an issue in this article?'),
            h('p', [
              h('a', { href: 'https://github.com/webpro/webpro.nl' }, 'Please let me know!'),
              ' This website is fully open-sourced at GitHub.',
            ]),
          ]
        : null;
    const footer = h('footer', text);
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
 * @type {Plugin<{ src: string }>}
 */
export const addScript =
  ({ src }) =>
  tree => {
    const script = h('script', { src });
    return append(tree, 'body', script);
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

/**
 * @type {Plugin<{ page: import('../types').Page; articles: import('../types').Article[]; }>}
 */
export const addBlogIndex =
  ({ page, articles }) =>
  async tree => {
    if (page.type === 'index') {
      const nodes = articles.map(article => {
        const a = h('a', { href: article.pathname, title: article.title }, article.title);
        const span = h('span', f.short(article.published));
        const li = h('li', [a, span]);
        return li;
      });

      const ul = h('ul', { class: 'index' }, nodes);

      visit(tree, 'element', node => {
        if (node.tagName === 'main') {
          node.children.unshift(ul);
          return false;
        }
      });
    }

    return tree;
  };
