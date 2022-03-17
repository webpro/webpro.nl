import yaml from 'js-yaml';
import { visit } from 'unist-util-visit';

/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('../types').Meta} Meta
 */

/**
 * @param {Root} tree
 * @returns {Partial<Meta>}
 */
export const getFrontMatter = tree => {
  try {
    const yamlNode = tree.children.find(node => node.type === 'yaml');
    return yaml.load(yamlNode.value);
  } catch (error) {
    console.log(error);
  }
  return {};
};

/**
 * @param {Root} tree
 */
export const getDocumentTitle = tree => {
  let title = '';
  visit(tree, 'heading', node => {
    if (node.depth === 1) {
      title = node.children[0].value;
      return false;
    }
  });
  return title;
};

/**
 * @param {Root} tree
 */
export const removeDocumentTitle = tree => {
  visit(tree, 'heading', (node, index, parent) => {
    if (node.depth === 1) {
      parent?.children.splice(index, 1);
      return false;
    }
  });
};
