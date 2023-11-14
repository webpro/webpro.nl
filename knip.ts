export default {
  ignoreDependencies: ['canvaskit-wasm', 'sharp'],
  compilers: {
    mdx: (text: string) => [...text.matchAll(/import[^;]+/g)].join('\n'),
    astro: (text: string) => [...text.matchAll(/import[^;]+/g)].join('\n'),
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join('\n'),
  },
};
