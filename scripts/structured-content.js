import merge from 'lodash.merge';
import { f } from './helpers.js';
import { HOST, AUTHOR, AUTHOR_WEBSITE, NAME, LOGO_PNG } from './constants.js';

const LOGO_PNG_HREF = HOST + LOGO_PNG;

/**
 * @typedef { import("./types").Meta } Meta
 * @typedef { import("schema-dts").Thing } Thing
 * @typedef { import("schema-dts").WithContext<Thing> } Schema
 * @typedef { import("schema-dts").Organization } Organization
 * @typedef { import("schema-dts").Person } Person
 */

/** @type {Person} */
const author = { '@type': 'Person', name: AUTHOR, url: AUTHOR_WEBSITE };

/** @type {Organization} */
const publisher = {
  '@type': 'Organization',
  '@id': `${AUTHOR_WEBSITE}/#organization`,
  name: NAME,
  logo: { '@type': 'ImageObject', url: LOGO_PNG_HREF },
};

/** @type {string[]} */
const sameAs = [
  'https://twitter.com/webprolific',
  'https://github.com/webpro',
  'https://www.linkedin.com/in/larskappert/',
];

/** @type {Schema} */
const base = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  author,
  publisher,
  mainEntityOfPage: { '@type': 'WebPage' },
};

/**
 * @param {Meta} page
 * @returns {Schema}
 */
const getPage = page =>
  merge({}, base, {
    '@type': 'WebSite',
    sameAs,
    datePublished: f.iso(page.published),
    dateModified: f.iso(page.modified),
    mainEntityOfPage: { '@id': page.href },
  });

/**
 * @param {Meta} page
 * @returns {Thing}
 */
const getArticle = page =>
  merge({}, base, {
    '@type': 'Article',
    headline: page.title,
    description: page.description,
    datePublished: f.iso(page.published),
    dateModified: f.iso(page.modified),
    mainEntityOfPage: { '@id': page.href },
    image: [page.image || LOGO_PNG_HREF],
  });

/**
 * @param {Meta} page
 * @returns {Thing}
 */
export const getStructuredContent = page => {
  switch (page.type) {
    case 'article':
      return getArticle(page);
    default:
      return getPage(page);
  }
};
