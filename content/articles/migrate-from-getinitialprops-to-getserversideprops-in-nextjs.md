---
published: 2022-03-10
modified: 2022-03-14
description:
  Differences between getInitialProps and getServerSideProps in Next.js
tags: nextjs, getInitialProps, getServerSideProps
---

# Migrate from getInitialProps to getServerSideProps in Next.js

Pages in Next.js can use either `getInitialProps` or `getServerSideProps` to
fetch data. This article will not repeat their documentation, but instead list
relevant differences, and shows example code to migrate from one to another.
This may provide some guidance when choosing or migrating between both methods.

Advantages of `getServerSideProps`:

- No need to implement isomorphic code.
- Has `resolvedUrl` (no need to mangle with `req.originalUrl` and `asPath`).
- Types can be inferred using `InferGetServerSidePropsType`.
- Features like `notFound` and `redirect` are available.
- Preview Mode is available.

On the other hand, it has a few downsides as well:

- The `basePath` is not available.
- Return value must be serializable to JSON.
- Requires and exposes the `/_next/data` endpoint.
- This `/_next/data` path includes a `.json` extension, which may result in
  unexpected caching (in another layer, like a CDN or API Gateway).

An example `Page.tsx` using `getInitialProps`:

```typescript
interface PageProps {
  content: unknown;
  statusCode: number;
  error?: Error;
  path: string;
}

const Page: NextPage<PageProps> = ({ content, statusCode, error, path }) => {
  return <div>{content}</div>;
};

Page.getInitialProps = async ({ req, res, asPath }): Promise<PageProps> => {
  // @ts-ignore We can count on `originalUrl`
  const resolvedUrl = req ? req.originalUrl : asPath;

  const { content, statusCode, error } = await fetchContent({ resolvedUrl });

  return { content, statusCode, error };
};

export default SitecoreRoute;
```

The same `Page.tsx` refactored to use `getServerSideProps`:

```typescript
type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const Page: NextPage<PageProps> = ({ content, statusCode, error }) => {
  return <div>{content}</div>;
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  resolvedUrl,
}) => {
  const { content, statusCode, error } = await fetchContent({ resolvedUrl });

  return {
    notFound: statusCode === 404,
    props: {
      content,
      statusCode,
      hasError: boolean(error),
    },
  };
};

export default Page;
```

Notice the differences:

- No need to type `PageProps` separately.
- Use `resolvedUrl` directly (no isomorphic logic).
- Move the return value to `props`.
- `hasError` is serializable (`error` is not).
- `getServerSideProps` is a separate export (not a member of `Page`).
