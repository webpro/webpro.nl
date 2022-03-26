import fs from 'node:fs';
import path from 'node:path';
import { globby } from 'globby';
import { HOST, LOGO_PNG } from './constants.js';

/**
 * @typedef { import("./types").Meta } Meta
 */

export const getTargetPathname = file => '/' + file.replace(/\.md$/, '').replace(/\/index$/, '');

export const getTargetPathnamePage = file =>
  '/' +
  file
    .replace(/\.md$/, '')
    .replace(/\/index$/, '')
    .replace(/pages/, '');

export const getTargetFile = file => path.join('dist', file.replace(/\.md$/, '').replace(/\/index$/, ''), 'index.html');

export const getTargetFileForPage = file =>
  path.join('dist', file.replace(/\.md$/, '').replace(/\/index$/, ''), 'index.html').replace(/pages\//, '');

export const copyAssets = async file => {
  if (path.basename(file) === 'index.md') {
    const sourceDir = path.dirname(file);
    const targetDir = path.dirname(getTargetFile(file));
    const assets = await globby(['**/*.*', '!*.md'], { cwd: sourceDir });
    assets.map(asset => {
      const target = path.join(targetDir, asset);
      console.log(`Copying ${target}`);
      fs.copyFileSync(path.join(sourceDir, asset), target);
    });
  }
};

const ensureDir = target => {
  const dir = path.dirname(target);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const write = (target, output) => {
  ensureDir(target);
  console.log(`Writing ${target}`);
  fs.writeFileSync(target, output);
};

const formatters = {
  short: new Intl.DateTimeFormat('en-CA'),
  long: new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }),
};

export const f = {
  short: value => (value ? formatters.short.format(new Date(value)) : undefined),
  long: value => (value ? formatters.long.format(new Date(value)) : undefined),
  iso: value => (value ? new Date(value).toISOString() : undefined),
  utc: value => (value ? new Date(value).toUTCString() : undefined),
};

/**
 * @param {Meta} meta
 * @returns {Array<{name?: string; content?: string, property?: string;}>}
 */
export const getMetaTags = ({ page, article }) => {
  const meta = Object.assign({}, page, article);
  const tags = [
    { name: 'author', content: 'Lars Kappert' },
    { name: 'description', property: 'og:description', content: meta.description },
    { name: 'twitter:description', content: meta.description },
    { property: 'og:url', content: page.href },
    { name: 'twitter:title', property: 'og:title', content: meta.title },
    { name: 'twitter:image', property: 'og:image', content: HOST + (meta.image || LOGO_PNG) },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@webprolific' },
    { name: 'twitter:creator', content: '@webprolific' },
    { name: 'twitter:image:alt', content: meta.title },
  ];
  switch (page.type) {
    case 'page':
      tags.push({ property: 'og:site_name', content: 'WebPro' });
      tags.push({ property: 'og:type', content: 'website' });
      break;
    case 'index':
      tags.push({ property: 'og:site_name', content: 'WebPro Blog' });
      tags.push({ property: 'og:type', content: 'website' });
      break;
    case 'article':
      tags.push({ property: 'og:site_name', content: 'WebPro Blog' });
      tags.push({ property: 'og:type', content: 'article' });
      tags.push({ property: 'article:published_time', content: f.iso(meta.published) });
      if (meta.modified) tags.push({ property: 'article:modified_time', content: f.iso(meta.modified) });
      break;
  }
  return tags;
};

/** @param {Meta[]} articles @returns {Meta[]} */
export const excludeDrafts = articles => articles.filter(article => !(process.env.CI && article.draft));

/** @param {Meta[]} articles @param {'published' | 'modified' | 'lastmod'} key @returns {Meta[]} */
export const sortByDate = (articles, key) => [...articles].sort((a, b) => new Date(b[key]) - new Date(a[key]));
