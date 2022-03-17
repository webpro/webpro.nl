type Item = {
  title: string;
  link: string;
  description: string;
  guid: string;
};

type Channel = {
  title: string;
  description: string;
  link: string;
  copyright: string;
  language: string;
  lastBuildDate: string;
  pubDate: string;
  ttl: string;
  docs: string;
  image: string;
  item: Item;
};

export type RSS = {
  channel: Channel;
};
