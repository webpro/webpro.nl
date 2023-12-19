import htm from 'htm';
import { h } from 'hastscript';
import type { State } from 'mdast-util-to-hast';
import type { Code } from 'mdast';

const html = htm.bind(h);

const prompt = html`<span class="prompt">$</span>`;
const cursor = html`<span class="blink"> </span>`;

const colorize = (value: string) =>
  value
    .split('\n')
    .map((line: string) => {
      if (line === '$') return html`${prompt} ${cursor}<br />`;
      if (line.startsWith('$')) return html`${prompt}${line.slice(1)}<br />`;
      if (line.startsWith('lars')) {
        const [usr, dir, promptOrGit, prompt, ...rest] = line.split(' ');
        const branchAndPrompt =
          promptOrGit.length === 1 ? promptOrGit : html`<span class="branch">${promptOrGit}</span> ${prompt}`;
        return html`<span class="user">${usr}</span>${' '}<span class="dir">${dir} </span>
          ${branchAndPrompt}${' '}${cursor}${' '}${rest.join(' ')}`;
      }
      return html`${line}<br />`;
    })
    .flat();

const buildShell = (node: Code) => {
  const meta = node.meta ? Object.fromEntries(node.meta.split(';').map(value => value.split('='))) : {};
  const title = meta.title ? html`<div class="title">${meta.title}</div>` : undefined;
  const buttons = html`<div class="buttons">
    <div class="button close" />
    <div class="button minimize" />
    <div class="button zoom" />
  </div>`;
  const header = title
    ? html`<div class="header">${buttons}${title}${buttons}</div>`
    : html`<div class="header">${buttons}</div>`;
  const content = colorize(node.value ?? '');
  const code = html`<pre tabindex="0"><code class="language-shell">${content}</code></pre>`;
  return html`<section class="terminal">${header}${code}</section>`;
};

export const code = (state: State, node: Code) => {
  if (node.lang === 'shell') return buildShell(node);
};
