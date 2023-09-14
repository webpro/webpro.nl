// const data = await import.meta.glob(['/src/content/**/*.md'], { eager: true });
const data = await import.meta.glob(['/src/pages/**/*.md'], { eager: true });

export const GET = async function ({ params, url }: { params: { route: string }; url: URL }) {
  return new Response('ok');
};

export const getStaticPaths = function () {
  return [];
};
