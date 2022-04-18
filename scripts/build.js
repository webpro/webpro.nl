import { MarkdownRambler } from 'markdown-rambler';
import { directives } from './hast/directives.js';
import transformers from './hast/transformers.js';
import converters from './mdast/convert.js';
import layout from './hast/layouts.js';

const NAME = 'WebPro';
const HOST = 'https://www.webpro.nl';
const AUTHOR = 'Lars Kappert';
const AUTHOR_WEBSITE = HOST;
const BLOG_NAME = 'Frontend Ramblings';
const BLOG_DESCRIPTION = 'Ramblings and scraps about frontend topics';
const BLOG_PATHNAME = '/blog';
const BLOG_RSS_PATHNAME = BLOG_PATHNAME + '/feed.xml';
const BLOG_RSS_NAME = BLOG_NAME + ' feed';
const LOGO_PNG = '/img/logo-512x512.png';
const LOGO_SVG = '/img/logo.svg';

const rambler = new MarkdownRambler({
  contentDir: 'content',
  outputDir: 'dist',
  verbose: false,
  host: HOST,
  name: NAME,
  type: filename => (filename.match(/^articles\//) ? 'article' : filename === 'blog.md' ? 'blog' : 'page'),
  linkFiles: true,
  converters,
  transformers,
  directives,
  feed: {
    pathname: BLOG_RSS_PATHNAME,
    title: BLOG_RSS_NAME,
    description: BLOG_DESCRIPTION,
  },
  defaults: {
    page: {
      layout,
      stylesheets: ['/css/fonts.css', '/css/stylesheet.css', '/css/theme-switch.css'],
      author: {
        name: AUTHOR,
        href: AUTHOR_WEBSITE,
        twitter: '@webprolific',
      },
      publisher: {
        name: NAME,
        href: HOST,
        logo: {
          src: HOST + LOGO_PNG,
        },
      },
      icon: {
        src: LOGO_SVG,
      },
      logo: {
        alt: NAME,
        src: LOGO_SVG,
        href: '/',
      },
      image: {
        alt: 'WebPro',
        src: LOGO_PNG,
      },
      sameAs: [
        'https://twitter.com/webprolific',
        'https://github.com/webpro',
        'https://www.linkedin.com/in/larskappert/',
      ],
    },
    blog: {
      logo: {
        alt: BLOG_NAME,
        src: LOGO_SVG,
        href: '/',
      },
    },
    article: {
      stylesheets: [
        '/css/fonts.css',
        '/css/stylesheet.css',
        '/css/theme-switch.css',
        '/css/hljs.github-dark-dimmed.min.css',
        '/css/terminal.css',
      ],
      sameAs: [],
      logo: {
        alt: BLOG_NAME,
        src: LOGO_SVG,
        href: '/blog',
      },
    },
  },
});

rambler.run();
if (process.argv.includes('--watch')) {
  rambler.watch(['content', 'public']);
}
