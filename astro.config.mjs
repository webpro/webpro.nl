import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkDirective from 'remark-directive';
import { moveTitle } from './src/remark/heading';
import sitemap from '@astrojs/sitemap';
import { transformDirectives, directives } from './src/remark/directives';
import { uncode } from './src/remark/uncode';
import { code } from './src/remark/code';
import vercelStatic from '@astrojs/vercel/static';

export default defineConfig({
  site: 'https:/astro.webpro.nl',
  adapter: vercelStatic(),
  output: 'static',
  trailingSlash: 'never',
  compressHTML: false,
  integrations: [mdx(), sitemap()],
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
    rehypePlugins: [],
  },
});
