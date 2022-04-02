import { h } from 'hastscript';
import { append, findElement } from './std-helpers.js';

/**
 * @typedef {import('unified').Plugin<[] | Array<void>, Root>} PluginWithoutOptions
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Parent} Parent
 * @typedef {import('hast').Element} Element
 * @typedef {import('unist-util-visit').VisitorResult} VisitorResult
 * @typedef {import('hast').ElementContent} ElementContent
 * @typedef {import('../types').Meta} Meta
 */

/**
 * @template T
 * @typedef {import('unified').Plugin<[T], Root>} Plugin<T>
 */

/**
 * @typedef {Function} DirectiveFunction
 * @param {Object} options
 * @param {Element} options.node
 * @param {number} options.index
 * @param {Parent} options.parent
 */

/**
 * @typedef {Object} DirectiveCache
 * @property {DirectiveFunction} fn
 * @property {Element} node
 * @property {number} index
 * @property {Parent} parent
 */

/**
 * @callback Matcher
 * @param {Element} node
 * @returns {Boolean}
 */

/**
 * @type {Plugin<{ type?: string; content: string }>}
 */
export const addInlineScript =
  ({ type, content }) =>
  tree => {
    const script = h('script', { type }, content);
    return append(tree, 'body', script);
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
 * @type {Plugin<Record<string, DirectiveFunction>>}>}
 */
export const handleDirectives = directives => async tree => {
  /** @type DirectiveCache[] */
  const replacementFns = [];

  /** @type Matcher */
  const matcher = node => node.tagName === 'p' && node.children.length === 1;

  findElement(tree, matcher, (node, index, parent) => {
    const text = String(node.children[0].value);
    const match = text.match(/^\[\[(?<directive>\w+)\]\]$/);
    if (match?.groups && match.groups.directive in directives) {
      const fn = directives[match.groups.directive];
      replacementFns.push({ fn, node, index, parent });
    }
  });

  for (let i = 0; i < replacementFns.length; i++) {
    const { fn, node, index, parent } = replacementFns[i];
    await fn({ node, index, parent });
  }

  return tree;
};
