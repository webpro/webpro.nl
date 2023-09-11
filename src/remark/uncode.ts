import { visit, type Visitor } from 'unist-util-visit';
import type { RemarkPlugin } from './types';

export const uncode: RemarkPlugin = () => tree => {
  const visitor: Visitor = node => {
    if (node.type === 'code' && 'lang' in node && node.lang === 'shell') {
      node.type = 'uncode';
    }
  };
  visit(tree, visitor);
};
