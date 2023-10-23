import { toString } from 'mdast-util-to-string';
import type { Root } from 'mdast';
import type { RemarkPlugin, MarkdownAstroData } from '@astrojs/markdown-remark';

interface VFile {
  data: {
    astro: MarkdownAstroData;
  };
}

export const moveTitle: RemarkPlugin = () => (tree: Root, file: VFile) => {
  const title = tree.children.find(node => node.type === 'heading' && node.depth === 1);
  if (title) {
    file.data.astro.frontmatter.title = toString(title);
    if (file.history.some(value => /\/(articles|scraps)\//.test(value))) {
      tree.children = tree.children.filter(node => node !== title); // TODO Remove properly
    }
  }
};
