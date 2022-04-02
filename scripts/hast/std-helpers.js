import { visit } from 'unist-util-visit';

/**
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Parent} Parent
 * @typedef {import('hast').Element} Element
 * @typedef {import('unist-util-visit').VisitorResult} VisitorResult
 * @typedef {import('hast').ElementContent} ElementContent
 * @typedef {import('../types').Meta} Meta
 */

/**
 * @callback VisitorCallback
 * @param {Element} node
 * @param {number} index
 * @param {Parent} parent
 */

/**
 * @callback Matcher
 * @param {Element} node
 * @returns {Boolean}
 */

/**
 * @param {Root} tree
 * @param {string | Matcher} tagName
 * @param {VisitorCallback} callback
 * @returns {VisitorResult}
 */
export const findElement = (tree, tagName, callback) => {
  /** @type Matcher */
  const matcher = typeof tagName === 'string' ? node => node.tagName === tagName : tagName;
  visit(tree, 'element', (node, index, parent) => {
    if (matcher(node) && parent && index !== null) {
      return callback(node, index, parent);
    }
  });
};

/**
 * @param {Root} tree
 * @param {string} tagName
 * @param {...ElementContent} elements
 * @returns {Root}
 */
export const append = (tree, tagName, ...elements) => {
  findElement(tree, tagName, node => {
    node.children.push(...elements);
    return false;
  });
  return tree;
};

/**
 * @param {Root} tree
 * @param {string | Matcher} tagName
 * @param {ElementContent} element
 * @returns {Root}
 */
export const insertBefore = (tree, tagName, element) => {
  findElement(tree, tagName, (node, index, parent) => {
    parent?.children.splice(index, 0, element);
    return false;
  });
  return tree;
};

/**
 * @param {Root} tree
 * @param {ElementContent} element
 * @returns {Root}
 */
export const insertBeforeStylesheets = (tree, element) => {
  /** @type Matcher */
  const matcher = node => {
    const rel = [node?.properties?.rel].flat();
    return node.tagName === 'link' && rel.includes('stylesheet');
  };
  return insertBefore(tree, matcher, element);
};
