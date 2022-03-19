import { unified } from 'unified';
import remarkParse from 'remark-parse';
import front from 'remark-frontmatter';

export default unified().use(remarkParse).use(front);
