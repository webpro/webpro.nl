/**
 * @typedef {import('markdown-rambler').Meta} Meta
 */

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

const short = value => (value ? value.toISOString().split('T')[0] : undefined);

const long = value =>
  value ? `${months[value.getUTCMonth()]} ${value.getUTCDate()}, ${value.getUTCFullYear()}` : undefined;

export const f = { short, long };

/** @type {(articles: Meta[], key: string) => Meta[]} */
export const sortByDate = (articles, key) => [...articles].sort((a, b) => +b[key] - +a[key]);
