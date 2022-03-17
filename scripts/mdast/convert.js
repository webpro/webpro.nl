import { unified } from 'unified';
import remark2rehype from 'remark-rehype';
import { code } from './code.js';

export default unified().use(remark2rehype, {
  handlers: {
    code,
  },
});

export const minimal = unified().use(remark2rehype);
