import { unified } from 'unified';
import rehypeStringify from 'rehype-stringify';
import rehypeFormat from 'rehype-format';

export default unified().use(rehypeStringify).use(rehypeFormat);
