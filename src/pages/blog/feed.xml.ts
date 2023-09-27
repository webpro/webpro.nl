import type { APIContext } from 'astro';
import rss from '@astrojs/rss';
import MarkdownIt from 'markdown-it';
import { BLOG_DESCRIPTION, AUTHOR, BLOG_RSS_PATHNAME, BLOG_RSS_NAME } from '../../consts';
import { getBlogIndex, getUrl } from '../../helpers';

const parser = new MarkdownIt();

export async function GET(context: APIContext) {
  const baseUrl = context.site?.href;
  const feedUrl = getUrl(BLOG_RSS_PATHNAME, baseUrl);
  const collection = await getBlogIndex();

  return rss({
    title: BLOG_RSS_NAME,
    description: BLOG_DESCRIPTION,
    site: baseUrl,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: [
      `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
      `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>`,
      `<language>en</language>`,
      `<copyright>© 2023 ${AUTHOR}</copyright>`,
      `<category>frontend</category>`,
      `<category>javascript</category>`,
      `<category>node.js</category>`,
      `<category>dotfiles</category>`,
      `<category>terminal</category>`,
    ].join(''),
    trailingSlash: false,
    items: collection.map(post => ({
      title: post.data.title ?? '(title missing)',
      pubDate: post.data.published,
      link: `/${post.collection}/${post.slug}`,
      description: parser.render(post.body.replace(/\s+# .+/, '')), // TODO Replace <h1> properly
      categories: post.data.tags ? post.data.tags.split(/[, ]+/) : [],
    })),
  });
}
