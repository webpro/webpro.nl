import { h } from 'hastscript';
import { f, sortByDate } from '../helpers.js';

const findDefinition = (collection, id) =>
  collection.find(element => element.type === 'definition' && element.identifier === id);

/** @type {import('markdown-rambler').DirectiveVisitor} */
const addFigure = (node, index, parent) => {
  const linkRef = node.children[0].children[0];
  const imgRef = linkRef.children[0];
  const alt = imgRef.alt;
  const href = findDefinition(parent.children, linkRef.identifier).url;
  const src = findDefinition(parent.children, imgRef.identifier).url;
  return h('figure', [h('img', { src, alt }), h('figcaption', h('a', { href }, alt))]);
};

/** @type {import('markdown-rambler').DirectiveVisitor} */
const addBlogIndex = (node, index, parent, vFile) => {
  const vFiles = [vFile.data.vFiles?.article, vFile.data.vFiles?.scrap].flat();
  const articles = vFiles.map(vFile => vFile.data.meta).filter(meta => meta && !meta.draft);
  const filtered = articles.filter(Boolean);
  const sorted = sortByDate(filtered, 'published');
  const nodes = sorted.map(article => {
    const a = h('a', { href: article.pathname, title: article.title }, article.title);
    const span = h('span', article.published ? f.short(article.published) : '');
    const li = h('li', [a, span]);
    return li;
  });
  return h('ul', { class: 'index' }, nodes);
};

/** @type {import('markdown-rambler').DirectiveVisitor} */
const addReferencesIndex = (node, index, parent, vFile) => {
  const vFiles = vFile.data.vFiles?.reference;
  const articles = vFiles?.map(vFile => vFile.data.meta).filter(meta => meta && !meta.draft) ?? [];
  const filtered = articles.filter(Boolean);
  const sorted = filtered.sort((a, b) => (a && b && a.title > b.title ? 1 : -1));
  const nodes = sorted.map(article => {
    const a = h('a', { href: article.pathname, title: article.title }, article.title);
    const li = h('li', a);
    return li;
  });
  return h('ul', nodes);
};

/** @type {import('markdown-rambler').Directives} */
export const directives = {
  BLOG_INDEX: addBlogIndex,
  REFERENCES_INDEX: addReferencesIndex,
  FIGURE: addFigure,
};
