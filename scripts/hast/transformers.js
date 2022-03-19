import { unified } from 'unified';
import doc from 'rehype-document';
import rehypeWrap from 'rehype-wrap';
import rehypeHighlight from 'rehype-highlight';
import rehypeFormat from 'rehype-format';
import {
  addBootScript,
  addPageHeader,
  enrichArticleHeading,
  addBlogIndex,
  addPageFooter,
  addScript,
  addInlineScript,
  addSimpleAnalytics,
  convertSprites,
} from './helpers.js';
import { getMetaTags } from '../helpers.js';
import { HOST, STYLESHEETS, LOGO_SVG, BLOG_RSS_PATHNAME } from '../constants.js';

const prefetch = {
  page: '/blog',
  article: '/blog',
  index: '/',
};

/**
 * @typedef { import("../types").Page } Page
 * @typedef { import("../types").Article } Article
 */

/**
 * @param {Object} options
 * @param {Page} options.page
 * @param {Article} [options.article]
 * @param {Article[]} [options.articles]
 * @param {unknown} options.structuredContent
 */
export default ({ page, article, articles, structuredContent }) =>
  unified()
    .use(doc, {
      title: article?.title ?? page.title,
      meta: getMetaTags({ page, article }),
      link: [
        { rel: 'canonical', href: page.href },
        ...STYLESHEETS.map(href => ({ rel: 'stylesheet', href })),
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', href: HOST + LOGO_SVG, type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.json' },
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          href: HOST + BLOG_RSS_PATHNAME,
          title: 'WebPro Blog RSS Feed',
        },
        { rel: 'prefetch', href: prefetch[page.type] },
      ],
    })
    .use(rehypeWrap, { wrapper: page.class ? `main.${page.class}` : 'main' })
    .use(addBootScript)
    .use(addPageHeader, { logo: { src: LOGO_SVG, href: page.logoHref, alt: page.logoTitle } })
    .use(enrichArticleHeading, article ? { page, article } : false)
    .use(convertSprites)
    .use(addBlogIndex, articles ? { page, articles } : false)
    .use(rehypeHighlight, { subset: ['js', 'typescript', 'json', 'css', 'html', 'yaml', 'bash'], plainText: ['txt'] })
    .use(addPageFooter, { type: page.type })
    .use(addScript, { src: '/js/theme-switch.js' })
    .use(addInlineScript, { type: 'application/ld+json', content: JSON.stringify(structuredContent) })
    .use(addSimpleAnalytics)
    .use(rehypeFormat);
