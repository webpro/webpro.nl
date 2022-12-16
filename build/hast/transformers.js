import rehypeHighlight from 'rehype-highlight';
import {
  addBootScript,
  enrichArticleHeading,
  addSimpleAnalytics,
  convertSprites,
  relateMyLinksToMe,
} from './plugins.js';

/** @type {import('markdown-rambler').Transformers} */
export default vFile => {
  const { meta } = vFile.data;
  return [
    [addBootScript],
    [enrichArticleHeading, meta],
    [convertSprites],
    [rehypeHighlight, { subset: ['js', 'typescript', 'json', 'css', 'html', 'yaml', 'bash'], plainText: ['txt'] }],
    [addSimpleAnalytics],
    [relateMyLinksToMe],
  ];
};
