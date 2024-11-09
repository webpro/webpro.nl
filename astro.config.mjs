import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import remarkDirective from 'remark-directive';
import { moveTitle } from './src/remark/heading';
import { transformDirectives, directives } from './src/remark/directives';
import autoLinkHeadings from 'rehype-autolink-headings';
import { uncode } from './src/remark/uncode';
import { code } from './src/remark/code';
import astroExpressiveCode from 'astro-expressive-code';

export default defineConfig({
  site: 'https://webpro.nl',
  output: 'static',
  trailingSlash: 'never',
  compressHTML: false,
  integrations: [astroExpressiveCode(), mdx()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
    },
    remarkPlugins: [moveTitle, [transformDirectives, directives], remarkDirective, uncode],
    remarkRehype: {
      handlers: {
        uncode: code,
      },
    },
    rehypePlugins: [rehypeHeadingIds, [autoLinkHeadings, { behavior: 'wrap', test: ['h2', 'h3', 'h4', 'h5', 'h6'] }]],
  },
});
