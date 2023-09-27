import type { APIContext } from 'astro';

const data = await import.meta.glob(['/src/{content,pages}/**/!([)*.{md,mdx,astro}'], { eager: true });

const pages = new Set<string>();
for (const [filePath, page] of Object.entries(data)) {
  if (page?.frontmatter?.draft === true) continue;
  pages.add(filePath.replace(/^\/src\/(content|pages)\//, '').replace(/(\/?index)?\.(md|mdx|astro)$/, ''));
}

export async function GET(context: APIContext) {
  const baseUrl = context.site?.href;
  const documents = [...pages].map(entry => new URL(entry, baseUrl).href).sort();
  return new Response(documents.join('\n'));
}
