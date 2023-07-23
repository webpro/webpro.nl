import rehypeHighlight from 'rehype-highlight';
import {
  addBootScript,
  enrichArticleHeading,
  addPreRenderScript,
  addSimpleAnalytics,
  convertSprites,
  relateMyLinksToMe,
} from './plugins.js';

const highlightOptions = {
  detect: false,
  subset: ['javascript', 'typescript', 'json', 'css', 'html', 'yaml', 'bash', 'shell'],
  plainText: ['txt'],
};

/** @type {import('markdown-rambler').Transformers} */
export default vFile => {
  const { meta } = vFile.data;
  return [
    [addPreRenderScript],
    [addBootScript],
    [enrichArticleHeading, meta],
    [convertSprites],
    [rehypeHighlight, highlightOptions],
    [addSimpleAnalytics],
    [relateMyLinksToMe],
  ];
};
