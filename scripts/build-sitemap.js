import { EOL } from 'node:os';
import { globby } from 'globby';
import { readSync } from 'to-vfile';
import parser from './mdast/parser.js';
import { getFrontMatter } from './mdast/helpers.js';
import { getTargetPathname, write } from './helpers.js';
import { HOST, BLOG_HREF } from './constants.js';

/**
 * @typedef {import('./sitemap').SiteMapEntry} SiteMapEntry
 */

const XML_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const XML_XSI = 'http://www.w3.org/2001/XMLSchema-instance';
const XSI_SCHEMA_LOCATION = [
  'http://www.sitemaps.org/schemas/sitemap/0.9',
  'http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd',
];

const articleFiles = await globby(['articles/**/*.md']);

/**
 * @param {string[]} articleFiles
 * @returns {(string | null)[]}
 */
const getArticlesMetaData = articleFiles =>
  articleFiles.map(post => {
    const vFile = readSync(post);
    const tree = parser.parse(vFile);
    const meta = getFrontMatter(tree);

    if (meta.draft) return null;

    const pathname = getTargetPathname(post);
    return BLOG_HREF + pathname;
  });

const main = async () => {
  const pages = [HOST, BLOG_HREF];
  const articles = await getArticlesMetaData(articleFiles);
  const sitemap = [...pages, ...articles].filter(Boolean);

  write('dist/sitemap.txt', sitemap.join(EOL) + EOL);
};

main();
