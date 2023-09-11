import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkDirective from 'remark-directive';
import { moveTitle } from './src/remark/heading';
import sitemap from '@astrojs/sitemap';
import { transformDirectives, directives } from './src/remark/directives';
import { uncode } from './src/remark/uncode';
import { code } from './src/remark/code';

export default defineConfig({
  site: 'https:/www.webpro.nl',
  trailingSlash: 'never',
  compressHTML: false,
  integrations: [mdx(), sitemap()],
  markdown: {
    // syntaxHighlight: false,
    shikiConfig: {
      theme: 'github-dark-dimmed',
      // excludeLangs: ['shell'],
    },
    remarkPlugins: [moveTitle, [transformDirectives, directives], remarkDirective, uncode],
    remarkRehype: {
      handlers: {
        uncode: code,
      },
    },
    rehypePlugins: [],
  },
});
