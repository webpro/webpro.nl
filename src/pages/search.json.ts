import MiniSearch from 'minisearch';
import { getBlogIndex } from '../helpers';

export async function GET() {
  const collection = await getBlogIndex();

  const documents = collection.map((entry, index) => ({
    id: index,
    title: entry.data.title,
    description: entry.data.description,
    pathname: `/${entry.collection}/${entry.slug}`,
    content: entry.body,
    tags: entry.tags,
  }));

  const miniSearch = new MiniSearch({
    fields: ['title', 'tags', 'description', 'content'],
    storeFields: ['title', 'description', 'pathname'],
  });

  await miniSearch.addAllAsync(documents);

  return new Response(JSON.stringify(miniSearch));
}
