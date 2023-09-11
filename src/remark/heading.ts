import { toString } from 'mdast-util-to-string';
import type { RemarkPlugin } from './types';

export const moveTitle: RemarkPlugin = () => (tree, file) => {
  const title = tree.children.find(node => node.type === 'heading' && node.depth === 1);
  if (title) {
    file.data.astro.frontmatter.title = toString(title);
    tree.children = tree.children.filter(node => node !== title); // TODO Remove properly
  }
};
