export interface Meta {
  type: 'page' | 'index' | 'article';
  title: string;
  description?: string;
  href?: string;
  pathname: string;
  author: Author;
  published: string;
  modified?: string;
  draft?: boolean;
  image?: string;
  class?: string;
  prefetch: string;
  logo: Logo;
}

export type Logo = {
  src: string;
  href: string;
  alt: string;
};

export type Author = {
  name: string;
  href: string;
};
