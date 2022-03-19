import { join } from 'node:path';
import { XMLBuilder } from 'fast-xml-parser';
import { globby } from 'globby';
import { readSync } from 'to-vfile';
import parser from './mdast/parser.js';
import { minimal } from './mdast/convert.js';
import render from './hast/render.js';
import { getFrontMatter, getDocumentTitle, removeDocumentTitle } from './mdast/helpers.js';
import { getTargetPathname, f, write } from './helpers.js';
import { HOST, BLOG_HREF, BLOG_NAME, BLOG_RSS_PATHNAME, LOGO_PNG } from './constants.js';

const XML_NS_CONTENT = 'http://purl.org/rss/1.0/modules/content/';
const XML_NS_ATOM = 'http://www.w3.org/2005/Atom';

const articleFiles = await globby(['articles/**/*.md']);

const text = item => {
  const [[key, value]] = Object.entries(item);
  return { [key]: [{ '#text': value }] };
};

const getPubDate = article => new Date(article.item[5].pubDate[0]['#text']);

const getArticles = async articleFiles => {
  return Promise.all(
    articleFiles.map(file => {
      return new Promise((resolve, reject) => {
        const vFile = readSync(file);
        const tree = parser.parse(vFile);
        const meta = getFrontMatter(tree);

        if (meta.draft) {
          resolve(null);
          return;
        }

        const title = getDocumentTitle(tree);
        const pathname = getTargetPathname(file);

        removeDocumentTitle(tree);

        minimal.run(tree, (error, document) => {
          if (error) return reject(error);
          const output = render.stringify(document);

          resolve({
            item: [
              text({ title }),
              text({ link: HOST + pathname }),
              text({ guid: HOST + pathname }),
              text({ description: meta.description }),
              text({ author: 'lars@webpro.nl (Lars Kappert)' }),
              text({ pubDate: f.utc(meta.published) }),
              {
                source: [{ '#text': BLOG_NAME }],
                ':@': { '@url': HOST + BLOG_RSS_PATHNAME },
              },
              { 'content:encoded': [{ '#CDATA': [{ '#text': output }] }] },
            ],
          });
        });
      });
    })
  );
};

const main = async () => {
  const articles = await getArticles(articleFiles);
  const recentArticles = articles
    .filter(Boolean)
    .sort((a, b) => (getPubDate(b) < getPubDate(a) ? -1 : 1))
    .slice(0, 10);

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@',
    preserveOrder: true,
    cdataPropName: '#CDATA',
  });

  const input = [
    { '?xml': [{ '#text': '' }], ':@': { '@version': '1.0' } },
    {
      ':@': { '@version': '2.0', '@xmlns:content': XML_NS_CONTENT, '@xmlns:atom': XML_NS_ATOM },
      rss: [
        {
          channel: [
            text({ title: BLOG_NAME }),
            {
              'atom:link': [{ '#text': '' }],
              ':@': { '@href': HOST + BLOG_RSS_PATHNAME, '@rel': 'self', '@type': 'application/rss+xml' },
            },
            text({ description: BLOG_NAME }),
            text({ link: BLOG_HREF }),
            text({ copyright: 'Copyright 2022, WebPro' }),
            text({ language: 'en-US' }),
            text({ lastBuildDate: new Date().toUTCString() }),
            text({ pubDate: f.utc('2022-03-06') }),
            text({ ttl: 60 }),
            text({ docs: 'https://www.rssboard.org/rss-specification' }),
            { image: [text({ url: HOST + LOGO_PNG }), text({ title: BLOG_NAME }), text({ link: BLOG_HREF })] },
            ...recentArticles,
          ],
        },
      ],
    },
  ];

  const output = builder.build(input);

  write(join('dist', BLOG_RSS_PATHNAME), output);
};

main();
