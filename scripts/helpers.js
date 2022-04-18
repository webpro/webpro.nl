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

export const sortByDate = (articles, key) => [...articles].sort((a, b) => +new Date(b[key]) - +new Date(a[key]));
