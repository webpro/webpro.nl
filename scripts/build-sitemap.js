import { EOL } from 'node:os';
import { globby } from 'globby';
import { readSync } from 'to-vfile';
import parser from './mdast/parser.js';
import { getFrontMatter } from './mdast/helpers.js';
import { getTargetPathname, write } from './helpers.js';
import { HOST } from './constants.js';

/**
 * @param {string[]} articleFiles
 * @returns {(string | null)[]}
 */
const getMetaData = articleFiles =>
  articleFiles.map(post => {
    const vFile = readSync(post);
    const tree = parser.parse(vFile);
    const meta = getFrontMatter(tree);

    if (meta.draft) return null;

    const pathname = getTargetPathname(post);
    return HOST + pathname;
  });

const main = async () => {
  const pages = await globby(['content/**/*.md']);
  const items = await getMetaData(pages);
  const sitemap = items.filter(Boolean);

  write('dist/sitemap.txt', sitemap.join(EOL) + EOL);
};

main();
