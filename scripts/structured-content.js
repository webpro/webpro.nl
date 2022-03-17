import merge from 'lodash.merge';
import { f } from './helpers.js';
import { HOST, AUTHOR, AUTHOR_WEBSITE, NAME, LOGO_PNG } from './constants.js';

const LOGO_PNG_HREF = HOST + LOGO_PNG;

/**
 * @typedef { import("./types").Page } Page
 * @typedef { import("./types").Article } Article
 * @typedef { import("./types").Author } Author
 */

/**
 * @type {Object}
 * @property {string} '@type'
 * @property {Author.name} name
 * @property {Author.href} url
 */
const author = { '@type': 'Person', name: AUTHOR, url: AUTHOR_WEBSITE };

const articleBase = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  author,
  publisher: { '@type': 'Organization', name: NAME, logo: { '@type': 'ImageObject', url: LOGO_PNG_HREF } },
  mainEntityOfPage: { '@type': 'WebPage' },
};

/**
 * @param {Object} options
 * @param {Page} options.page
 */
const getPage = ({ page }) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Website',
    author,
    publisher: {
      '@type': 'Organization',
      '@id': `${AUTHOR_WEBSITE}/#organization`,
      name: NAME,
      logo: { '@type': 'ImageObject', url: page.image || LOGO_PNG_HREF },
    },
    sameAs: [
      'https://twitter.com/webprolific',
      'https://github.com/webpro',
      'https://www.linkedin.com/in/larskappert/',
    ],
    datePublished: f.iso(page.published),
    dateModified: f.iso(page.modified),
    mainEntityOfPage: { '@type': 'WebPage', '@id': page.href },
  };
};

/**
 * @param {Object} options
 * @param {Page} options.page
 */
const getIndex = ({ page }) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Website',
    author,
    publisher: {
      '@type': 'Organization',
      '@id': `${AUTHOR_WEBSITE}/#organization`,
      name: NAME,
      logo: { '@type': 'ImageObject', url: page.image || LOGO_PNG_HREF },
    },
    sameAs: [
      'https://twitter.com/webprolific',
      'https://github.com/webpro',
      'https://www.linkedin.com/in/larskappert/',
    ],
    datePublished: f.iso(page.published),
    dateModified: f.iso(page.modified),
    mainEntityOfPage: { '@type': 'WebPage', '@id': page.href },
  };
};

/**
 * @param {Object} options
 * @param {Page} options.page
 * @param {Article} options.article
 */
const getArticle = ({ article, page }) => {
  return merge({}, articleBase, {
    headline: article.title,
    description: article.description,
    datePublished: f.iso(article.published),
    dateModified: f.iso(article.modified),
    mainEntityOfPage: {
      '@id': page.href,
    },
    image: [article.image || LOGO_PNG_HREF],
  });
};

export default {
  getPage,
  getIndex,
  getArticle,
};
