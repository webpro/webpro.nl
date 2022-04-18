import rehypeHighlight from 'rehype-highlight';
import { addScript } from 'markdown-rambler';
import { addBootScript, enrichArticleHeading, addSimpleAnalytics, convertSprites } from './plugins.js';

/** @type {import("markdown-rambler").Transformers} */
export default vFile => {
  const { meta } = vFile.data;
  return [
    [addBootScript],
    [enrichArticleHeading, meta?.type === 'article' ? meta : false],
    [convertSprites],
    [rehypeHighlight, { subset: ['js', 'typescript', 'json', 'css', 'html', 'yaml', 'bash'], plainText: ['txt'] }],
    [addScript, { src: '/js/theme-switch.js' }],
    [addSimpleAnalytics],
  ];
};
