export interface Page {
  type: 'page' | 'index' | 'article';
  title: string;
  description: string;
  href: string;
  pathname: string;
  draft?: boolean;
  image?: string;
  published: string;
  modified?: string;
  logoHref: string;
  logoTitle: string;
  class?: string;
}

export interface Article {
  title: string;
  description: string;
  author: Author;
  image: string;
  draft?: boolean;
  published: string;
  modified?: string;
  articles?: Article[];
}

export type ArticleMeta = Pick<Page, 'pathname' | 'href'> | Pick<Article, 'title'>;

export type Logo = {
  src: string;
  href: string;
  alt: string;
};

export type Author = {
  name: string;
  href: string;
};
