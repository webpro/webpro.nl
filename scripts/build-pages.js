import { readSync } from 'to-vfile';
import { globby } from 'globby';
import parser from './mdast/parser.js';
import convert from './mdast/convert.js';
import getTransformers from './hast/transformers.js';
import render from './hast/render.js';
import SC from './structured-content.js';
import { getFrontMatter, getDocumentTitle } from './mdast/helpers.js';
import { getTargetPathnamePage, getTargetFileForPage, write } from './helpers.js';
import { HOST, NAME } from './constants.js';

const pages = await globby(['pages/**/*.md']);

const handleMarkdownFile = async file => {
  try {
    // Read Markdown file and build mdast
    const vFile = readSync(file);
    const tree = parser.parse(vFile);

    // Build meta data
    const pathname = getTargetPathnamePage(file);

    /** @type {import('./types').Page} */
    const page = {
      type: 'page',
      href: HOST + pathname,
      title: NAME,
      pathname,
      logoHref: '/',
      logoTitle: NAME,
    };
    Object.assign(page, getFrontMatter(tree));

    // Skip drafts in production
    if (page.draft && process.env.CI) {
      return;
    }

    page.title = page.title ?? getDocumentTitle(tree);
    const structuredContent = SC.getPage({ page });

    // Convert mdast to hast
    convert.run(tree, (error, node) => {
      if (error) console.error(error);
      // Enrich hast to document
      const transformers = getTransformers({ page, structuredContent });
      transformers.run(node, async (error, document) => {
        if (error) console.error(error);
        const target = getTargetFileForPage(file);
        // Render hast to HTML
        const output = render.stringify(document);
        write(target, output);
      });
    });
  } catch (error) {
    console.error(error);
  }
};

pages.forEach(handleMarkdownFile);
