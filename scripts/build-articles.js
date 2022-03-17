import fs from 'node:fs';
import path from 'node:path';
import { readSync } from 'to-vfile';
import { globby } from 'globby';
import parser from './mdast/parser.js';
import convert from './mdast/convert.js';
import getTransformers from './hast/transformers.js';
import render from './hast/render.js';
import SC from './structured-content.js';
import { getFrontMatter, getDocumentTitle } from './mdast/helpers.js';
import { getTargetPathname, getTargetFile, write, copyAssets } from './helpers.js';
import { HOST, BLOG_PATHNAME, BLOG_NAME, AUTHOR, AUTHOR_WEBSITE } from './constants.js';

const args = process.argv.splice(2);

const articles = await globby(['articles/**/*.md']);

const handleMarkdownFile = async file => {
  try {
    // Read Markdown file and build mdast
    const vFile = readSync(file);
    const tree = parser.parse(vFile);

    // Build meta data
    const pathname = getTargetPathname(file);

    /** @type {import('./types').Page} */
    const page = {
      type: 'article',
      href: HOST + pathname,
      pathname,
      logoHref: BLOG_PATHNAME,
      logoTitle: BLOG_NAME,
    };

    /** @type {import('./types').Article} */
    const article = getFrontMatter(tree);

    // Skip drafts in production
    if (article.draft && process.env.CI) {
      return;
    }

    article.title = getDocumentTitle(tree);
    article.author = {
      name: AUTHOR,
      href: AUTHOR_WEBSITE,
    };

    const structuredContent = SC.getArticle({ page, article });

    // Convert mdast to hast
    convert.run(tree, (error, node) => {
      if (error) console.error(error);
      // Enrich hast to document
      const transformers = getTransformers({ page, article, structuredContent });
      transformers.run(node, async (error, document) => {
        if (error) console.error(error);
        const target = getTargetFile(file);
        // Render hast to HTML
        const output = render.stringify(document);
        write(target, output);
        // Copy assets
        copyAssets(file);
      });
    });
  } catch (error) {
    console.error(error);
  }
};

articles.forEach(handleMarkdownFile);

if (args.includes('--watch')) {
  const callback = (eventType, filename) => {
    if (filename) {
      const file = path.join('articles', filename);
      handleMarkdownFile(file);
    } else {
      console.warn('Filename not provided for', eventType, filename);
    }
  };
  fs.watch('articles', { recursive: true }, callback);
  console.log('Watching', 'articles', 'for changes...');
}
