import rss from '@astrojs/rss';
import MarkdownIt from 'markdown-it';
import { BLOG_NAME, BLOG_DESCRIPTION, HOST, AUTHOR, BLOG_RSS_PATHNAME } from '../../consts';
import { getBlogIndex, getUrl } from '../../helpers';

const parser = new MarkdownIt();

const feedUrl = getUrl(BLOG_RSS_PATHNAME, HOST);

export async function GET(context) {
  const collection = await getBlogIndex();

  return rss({
    title: BLOG_NAME,
    description: BLOG_DESCRIPTION,
    site: HOST,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: [
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
    items: collection.map((post) => ({
      title: post.data.title ?? 'TITLE MISSING',
      pubDate: post.data.published,
      link: `/${post.collection}/${post.slug}`,
      description: parser.render(post.body.replace(/\s+# .+/, '')), // TODO Replace <h1> properly
      categories: post.data.tags ? post.data.tags.split(/[, ]+/) : [],
    })),
  });
}
