import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import front from 'remark-frontmatter';

export default unified().use(remarkParse).use(front).use(remarkGfm);
