import { h } from 'hastscript';
import { f, sortByDate } from '../helpers.js';

/** @type {import("markdown-rambler").DirectiveVisitor} */
const addBlogIndex = (node, index, parent, vFile) => {
  const vFiles = vFile.data.vFiles?.article || [];
  const articles = vFiles.map(vFile => vFile.data.meta);
  const sorted = sortByDate(articles, 'published');
  const nodes = sorted.map(article => {
    const a = h('a', { href: article.pathname, title: article.title }, article.title);
    const span = h('span', f.short(article.published));
    const li = h('li', [a, span]);
    return li;
  });
  return h('ul', { class: 'index' }, nodes);
};

/** @type {import("markdown-rambler").Directives} */
export const directives = {
  BLOG_INDEX: addBlogIndex,
};
