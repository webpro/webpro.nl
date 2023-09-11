import { type CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';

type EntryType = 'articles' | 'scraps';

export type Entry = CollectionEntry<EntryType>;

const sortByPublishData = (a: Entry, b: Entry) => b.data.published.valueOf() - a.data.published.valueOf();

const syncMetaData = async (entry: Entry) => {
  const { remarkPluginFrontmatter } = await entry.render();
  entry.data = { ...remarkPluginFrontmatter, ...entry.data };
};

const get = async (type: EntryType) => {
  const collection: Entry[] = await getCollection(type);
  for (const entry of collection) await syncMetaData(entry);
  return collection;
};

export const getBlogIndex = async ({ drafts = false } = {}) => {
  const collection = [await get('articles'), await get('scraps')].flat().sort(sortByPublishData);
  if (!drafts) return collection.filter(entry => entry.data.draft !== true);
  return collection;
};

export const getScraps = async () => get('scraps');

export const getArticles = async () => get('articles');

export const getUrl = (pathname: string, base: string | URL | undefined) => new URL(pathname.replace(/\/$/, ''), base);
