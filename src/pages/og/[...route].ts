import { generateOpenGraphImage } from 'astro-og-canvas';
import { join } from 'path';

const data = await import.meta.glob(['/src/pages/**/*.md', '/src/content/**/*.md'], { eager: true });
const pages: Record<string, unknown> = {};

for (const [filePath, page] of Object.entries(data)) {
  pages[filePath.replace(/^\/src\/(content|pages)\//, '').replace(/(\/index)?\.md$/, '.webp')] = page;
}

const getImageOptions = (page, url: URL) => {
  const isBlog = /\/(scraps|articles)\//.test(page.file);
  return {
    title: page.frontmatter.title,
    description: isBlog
      ? `Frontend Ramblings (Lars Kappert, ${page.frontmatter.published.split('T')[0]})`
      : 'Lars Kappert (WebPro)',
    padding: 80,
    bgGradient: [
      [42, 42, 42],
      [24, 24, 24],
    ],
    logo: {
      path: './public/img/logo-512x512.png',
      size: [150],
    },
    font: {
      title: { size: 68, weight: 'Normal', families: ['Source Sans Pro'], lineHeight: 1.2 },
      description: { color: [246, 138, 34], size: 24, weight: 'Normal', lineHeight: 1, families: ['Hack'] },
    },
    fonts: [
      join(url.origin, 'font/6xK3dSBYKcSV-LCoeQqfX1RYOo3qOK7lujVj9w.woff2'),
      join(url.origin, 'font/hack-regular-subset.woff2'),
    ],
    format: 'PNG',
  };
};

export const GET = async function ({ params, url }: { params: { route: string }; url: URL }) {
  const pageEntry = pages[params.route];
  if (!pageEntry) return new Response('Page not found', { status: 404 });
  return new Response(await generateOpenGraphImage(getImageOptions(pageEntry, url)));
};

export const getStaticPaths = function () {
  return Object.keys(pages).map(route => ({ params: { route } }));
};
