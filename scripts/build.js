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
const BLOG_LOGO_WEBP = '/img/logo-blog.webp';
const LOGO_PNG = '/img/logo-512x512.png';
const LOGO_SVG = '/img/logo.svg';

const isWatching = process.argv.includes('--watch');

const rambler = new MarkdownRambler({
  contentDir: 'content',
  outputDir: 'dist',
  watch: isWatching,
  verbose: isWatching,
  formatMarkdown: true,
  search: {
    filter: type => type === 'article',
  },
  host: isWatching ? '' : HOST, // Trick to load assets locally in dev mode
  name: NAME,
  type: filename => {
    switch (true) {
      case /^articles\//.test(filename):
        return 'article';
      case filename === 'blog.md':
        return 'blog';
      default:
        return 'page';
    }
  },
  linkFiles: true,
  converters,
  transformers,
  directives,
  feed: {
    pathname: BLOG_RSS_PATHNAME,
    title: BLOG_RSS_NAME,
    description: BLOG_DESCRIPTION,
    filter: type => type === 'article',
  },
  defaults: {
    page: {
      layout,
      stylesheets: ['/css/fonts.css', '/css/stylesheet.css', '/css/theme-switch.css', '/css/search.css'],
      scripts: ['/js/minisearch.4.0.3.min.js', '/js/search.js'],
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
        '/css/search.css',
      ],
      sameAs: [],
      image: {
        alt: 'Frontend Ramblings',
        src: BLOG_LOGO_WEBP,
      },
      logo: {
        alt: BLOG_NAME,
        src: LOGO_SVG,
        href: '/blog',
      },
    },
  },
});

rambler.run();
