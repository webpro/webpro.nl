import { deepmerge } from 'deepmerge-ts';
import type { Thing, WithContext } from 'schema-dts';

type Schema = WithContext<Thing>;

interface Data {
  type: 'page' | 'article';
  title: string;
  description: string;
  href: string;
  published: string;
  modified: string;
  language: string;
  tags: string[];
  author: { name: string; href: string };
  publisher: { href: string; name: string; logo: { src: string } };
  image: { src: string };
  sameAs: string[];
}

export const getStructuredContent = (data: Data): Schema => {
  const base: Schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: { '@type': 'WebPage', '@id': data.href },
    datePublished: data.published,
    dateModified: data.modified,
    inLanguage: data.language,
  };

  if (data.tags?.length > 0) {
    base.keywords = data.tags.join(',');
  }

  if (data.author) {
    base.author = { '@type': 'Person', name: data.author.name, url: data.author.href };
  }

  if (data.publisher) {
    base.publisher = {
      '@type': 'Organization',
      '@id': `${data.publisher.href}/#organization`,
      name: data.publisher.name,
      logo: { '@type': 'ImageObject', url: data.publisher.logo.src },
    };
  }

  const image = data.image?.src || data.publisher?.logo?.src;

  switch (data.type) {
    case 'article':
      return deepmerge(
        base,
        {
          headline: data.title,
          description: data.description,
        },
        image ? { image } : {},
      );
    default:
      return deepmerge(base, {
        '@type': 'WebSite',
        sameAs: data.sameAs,
      });
  }
};
