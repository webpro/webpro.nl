import { h } from 'hastscript';
import { f, getArticlesMetaData } from '../helpers.js';

const addBlogIndex = async ({ node, index, parent }) => {
  const articles = await getArticlesMetaData();

  const nodes = articles.map(article => {
    const a = h('a', { href: article.pathname, title: article.title }, article.title);
    const span = h('span', f.short(article.published));
    const li = h('li', [a, span]);
    return li;
  });

  parent.children[index] = h('ul', { class: 'index' }, nodes);
};

export const DIRECTIVES = {
  BLOG_INDEX: addBlogIndex,
};
