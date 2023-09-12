import htm from 'htm';
import { h } from 'hastscript';
import { visit, type Visitor } from 'unist-util-visit';
import type { Parent } from 'unist';
import type { VFile } from 'vfile';
import type { Element } from 'hast';
import type { RemarkPlugin } from './types';

const html = htm.bind(h);

type DirectiveVisitor = (node: Element, index: number, parent: Parent, vFile: VFile) => Element;

type Directives = Record<string, DirectiveVisitor>;

const findDefinition = (collection, id) =>
  collection.find(element => element.type === 'definition' && element.identifier === id);

const addFigure: DirectiveVisitor = (node, index, parent) => {
  const linkRef = node.children[0].children[0];
  const imgRef = linkRef.children[0];
  const alt = imgRef.alt;
  const href = findDefinition(parent.children, linkRef.identifier)?.url;
  const src = findDefinition(parent.children, imgRef.identifier)?.url;
  return html`<figure>
    <img src="${src}" alt="${alt}" />
    <figcaption><a href="${href}">${alt}</a></figcaption>
  </figure>`;
};

export const directives = {
  FIGURE: addFigure,
};

export const transformDirectives: RemarkPlugin = (directives: Directives) => (tree, vFile) => {
  const visitor: Visitor = (node, index, parent) => {
    if (node.type === 'textDirective' || node.type === 'leafDirective' || node.type === 'containerDirective') {
      // Ignore inline text directives not prefixed with a space (e.g. `unexpected:span`)
      const previousSibling = node.type === 'textDirective' && parent.children[index - 1];
      if (node.type === 'textDirective' && previousSibling && !previousSibling.value.endsWith(' ')) {
        node.type = 'text';
        node.value = `:${node.name}`;
        return;
      }

      if (node.name in directives) {
        const hast = directives[node.name](node, index, parent, vFile);
        const data = node.data || (node.data = {});
        data.hName = hast.tagName;
        data.hProperties = hast.properties;
        data.hChildren = hast.children;
      } else {
        const hast = h(node.name, node.attributes);
        const data = node.data || (node.data = {});
        data.hName = hast.tagName;
        data.hProperties = hast.properties;
      }
    }
  };
  visit(tree, visitor);
};
