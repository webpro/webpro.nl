import remark2rehype from 'remark-rehype';
import { code } from './code.js';

export default [[remark2rehype, { handlers: { code } }]];
