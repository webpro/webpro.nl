import fs from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { globby } from 'globby';
import { readMarkdown } from './mdast/helpers.js';
import { SOURCE_DIR, TARGET_DIR } from './constants.js';

/**
 * @typedef { import("./types").Meta } Meta
 */

export const getTargetFilePath = filename => join(TARGET_DIR, relative(SOURCE_DIR, filename));

export const getTargetPathname = filename =>
  `/${relative(SOURCE_DIR, filename)
    .replace(/(index)?\.md$/, '')
    .replace(/(.+)\/$/, '$1')}`;

export const ensureDir = target => {
  const dir = dirname(target);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const write = (target, output) => {
  console.log(`Writing ${target}`);
  fs.writeFileSync(target, output);
};

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const f = {
  short: value => (value ? value.toISOString().split('T')[0] : undefined),
  long: value =>
    value ? `${months[value.getUTCMonth()]} ${value.getUTCDate()}, ${value.getUTCFullYear()}` : undefined,
  iso: value => (value ? new Date(value).toISOString() : undefined),
  utc: value => (value ? new Date(value).toUTCString() : undefined),
};

/** @param {Meta[]} articles @returns {Meta[]} */
export const excludeDrafts = articles => articles.filter(article => !(process.env.CI && article.draft));

/** @param {Meta[]} articles @param {'published' | 'modified'} key @returns {Meta[]} */
export const sortByDate = (articles, key) => [...articles].sort((a, b) => new Date(b[key]) - new Date(a[key]));

/** @returns {Promise<Meta[]>} */
export const getArticlesMetaData = async () => {
  const articleFiles = await globby(['content/articles/**/*.md']);
  const articlesMetaData = articleFiles.map(file => {
    const { frontMatter, title } = readMarkdown(file);
    const pathname = getTargetPathname(file);
    return Object.assign({ type: 'article', pathname, title, published: frontMatter.published });
  });
  const finalArticles = excludeDrafts(articlesMetaData);
  // const sortedByModified = sortByDate(finalArticles, 'modified');
  return sortByDate(finalArticles, 'published');
};
