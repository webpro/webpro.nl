import { unified } from 'unified';
import doc from 'rehype-document';
import rehypeWrap from 'rehype-wrap';
import rehypeHighlight from 'rehype-highlight';
import rehypeFormat from 'rehype-format';
import { handleDirectives, addScript, addInlineScript } from './std-plugins.js';
import {
  addBootScript,
  addPageHeader,
  enrichArticleHeading,
  addPageFooter,
  addSimpleAnalytics,
  convertSprites,
} from './plugins.js';
import { DIRECTIVES } from './directives.js';
import { getMetaTags, getLinks } from './doc.js';

/**
 * @typedef { import("../types").Meta } Meta
 */

/**
 * @param {Object} options
 * @param {Meta} options.meta
 * @param {unknown} options.structuredContent
 */
export default ({ meta, structuredContent }) =>
  unified()
    .use(doc, {
      title: meta.title,
      meta: getMetaTags(meta),
      link: getLinks(meta),
    })
    .use(rehypeWrap, { wrapper: meta.class ? `main.${meta.class}` : 'main' })
    .use(addBootScript)
    .use(addPageHeader, { logo: meta.logo })
    .use(enrichArticleHeading, meta.type === 'article' ? { meta } : false)
    .use(convertSprites)
    .use(handleDirectives, DIRECTIVES)
    .use(rehypeHighlight, { subset: ['js', 'typescript', 'json', 'css', 'html', 'yaml', 'bash'], plainText: ['txt'] })
    .use(addPageFooter, { type: meta.type })
    .use(addScript, { src: '/js/theme-switch.js' })
    .use(addInlineScript, { type: 'application/ld+json', content: JSON.stringify(structuredContent) })
    .use(addSimpleAnalytics)
    .use(rehypeFormat);
