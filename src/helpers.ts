import { type CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';

type EntryType = 'articles' | 'scraps' | 'references';

export type Entry = CollectionEntry<EntryType>;

export type BlogEntry = CollectionEntry<'articles' | 'scraps'>;

export const withoutDrafts = (collection: Awaited<ReturnType<typeof getCollection>>) =>
  collection.filter(entry => entry.data && entry.data.draft !== true);

const sortByPublishData = (a: BlogEntry, b: BlogEntry) => b.data.published.valueOf() - a.data.published.valueOf();

const syncMetaData = async (entry: Entry) => {
  const { remarkPluginFrontmatter } = await entry.render();
  entry.data = { ...remarkPluginFrontmatter, ...entry.data };
};

const get = async (type: EntryType) => {
  const collection = await getCollection(type);
  for (const entry of collection) await syncMetaData(entry);
  return collection;
};

export const getBlogIndex = async ({ drafts = false } = {}) => {
  const collection = (await getBlogEntries()).sort(sortByPublishData);
  if (!drafts) return withoutDrafts(collection);
  return collection;
};

const getBlogEntries = async () => [await get('articles'), await get('scraps')].flat();

export const getArticles = () => get('articles');

export const getScraps = () => get('scraps');

export const getReferences = () => get('references');

export const getUrl = (pathname: string, base: string | URL | undefined) => new URL(pathname.replace(/\/$/, ''), base);
