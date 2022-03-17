import { globby } from 'globby';
import { readSync } from 'to-vfile';
import { unified } from 'unified';
import parser from './mdast/parser.js';
import convert from './mdast/convert.js';
import getTransformers from './hast/transformers.js';
import render from './hast/render.js';
import SC from './structured-content.js';
import remarkParse from 'remark-parse';
import { getFrontMatter, getDocumentTitle } from './mdast/helpers.js';
import { getTargetPathname, sortByDate, excludeDrafts, write } from './helpers.js';
import { NAME, BLOG_HREF, BLOG_PATHNAME, BLOG_NAME, LOGO_PNG } from './constants.js';

/**
 * @typedef {import('./types').Page} Page
 * @typedef {import('./types').ArticleMeta} ArticleMeta
 */

const articleFiles = await globby(['articles/**/*.md']);

/**
 * @param {string[]} articleFiles
 * @returns {ArticleMeta[]}
 */
const getArticlesMetaData = articleFiles =>
  articleFiles.map(file => {
    const vFile = readSync(file);
    const tree = parser.parse(vFile);
    const meta = getFrontMatter(tree);
    const title = getDocumentTitle(tree);
    const pathname = getTargetPathname(file);
    return {
      ...meta,
      pathname,
      href: BLOG_HREF + pathname,
      title,
    };
  });

const main = async () => {
  // Build empty mdast tree
  const tree = unified().use(remarkParse).parse('');

  // Get articles meta data
  const articlesMetaData = await getArticlesMetaData(articleFiles);
  const finalArticles = excludeDrafts(articlesMetaData);
  const sortedByModified = sortByDate(finalArticles, 'modified');

  /** @type {Page} */
  const page = {
    type: 'index',
    pathname: BLOG_PATHNAME,
    logoHref: '/',
    logoTitle: NAME,
    href: BLOG_HREF,
    title: BLOG_NAME,
    description: BLOG_NAME,
    image: LOGO_PNG,
    published: '2022-02-26',
    modified: sortedByModified[0].modified,
  };

  const articles = sortByDate(finalArticles, 'published');
  const structuredContent = SC.getIndex({ page });

  // Convert mdast to hast
  convert.run(tree, (error, node) => {
    if (error) console.error(error);
    // Enrich hast to document
    const transformers = getTransformers({ page, articles, structuredContent });
    transformers.run(node, (error, document) => {
      if (error) console.error(error);
      // Render hast to HTML
      const output = render.stringify(document);
      write('dist/blog/index.html', output);
    });
  });
};

main();
