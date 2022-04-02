import fs from 'node:fs';
import { join, relative } from 'node:path';
import { globby } from 'globby';
import { readMarkdown } from './mdast/helpers.js';
import convert from './mdast/convert.js';
import getTransformers from './hast/transformers.js';
import render from './hast/render.js';
import { getStructuredContent } from './structured-content.js';
import { getTargetFilePath, getTargetPathname, ensureDir, write } from './helpers.js';
import {
  HOST,
  NAME,
  AUTHOR,
  AUTHOR_WEBSITE,
  BLOG_PATHNAME,
  LOGO_SVG,
  LOGO_PNG,
  SOURCE_DIR,
  TARGET_DIR,
  BLOG_NAME,
} from './constants.js';

const args = process.argv.splice(2);

/** @param {string} sourceFilePath; @param {string} targetFilePath */
const handleMarkdownFile = async (sourceFilePath, targetFilePath) => {
  try {
    // Read Markdown file and build mdast
    const { tree, frontMatter, title } = readMarkdown(sourceFilePath);

    const pathname = getTargetPathname(sourceFilePath);

    const type = frontMatter.type ?? (sourceFilePath.includes('articles/') ? 'article' : 'page');

    /** @type {import('./types').Meta} */
    const meta = Object.assign(
      {
        type,
        published: Date.now(),
        href: HOST + pathname,
        pathname,
        title: title ?? NAME,
        image: LOGO_PNG,
        prefetch: BLOG_PATHNAME,
        author: {
          name: AUTHOR,
          href: AUTHOR_WEBSITE,
        },
        logo: {
          src: LOGO_SVG,
          href: type === 'article' ? BLOG_PATHNAME : '/',
          alt: type === 'article' ? BLOG_NAME : NAME,
        },
      },
      frontMatter
    );

    // Skip drafts in production
    if (frontMatter.draft && process.env.CI) {
      return;
    }

    const structuredContent = getStructuredContent(meta);

    // Convert mdast to hast
    convert.run(tree, (error, node) => {
      if (error) console.error(error);
      // Enrich hast to document
      const transformers = getTransformers({ meta, structuredContent });
      transformers.run(node, async (error, document) => {
        if (error) console.error(error);
        // Render hast to HTML
        const output = render.stringify(document);
        write(targetFilePath, output);
      });
    });
  } catch (error) {
    console.error(error);
  }
};

/** @param {string} filename */
const handleFile = filename => {
  if (filename.endsWith('.md')) {
    const targetFilePath = join(getTargetFilePath(filename).replace(/(index)?\.md$/, ''), 'index.html');
    ensureDir(targetFilePath);
    handleMarkdownFile(filename, targetFilePath);
  } else {
    const targetFilePath = getTargetFilePath(filename);
    ensureDir(targetFilePath);
    console.log(`Copying ${relative(TARGET_DIR, targetFilePath)}`);
    fs.copyFileSync(filename, targetFilePath);
  }
};

const main = async () => {
  const content = await globby(`${SOURCE_DIR}/**/*`);
  content.forEach(handleFile);

  if (args.includes('--watch')) {
    fs.watch(SOURCE_DIR, { recursive: true }, (eventType, filename) => {
      if (filename) {
        handleFile(join(SOURCE_DIR, filename));
      } else {
        console.warn('Filename not provided for', eventType, filename);
      }
    });
    console.log(`Watching ${SOURCE_DIR} for changes...`);
  }
};

main();
