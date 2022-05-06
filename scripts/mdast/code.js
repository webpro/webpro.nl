import { u } from 'unist-builder';

/**
 * @typedef {import('mdast-util-to-hast').H} H
 * @typedef {import('mdast-util-to-hast').Handler} Handler
 * @typedef {import('mdast').Code} Code
 */

const text = text => u('text', text);
const newline = () => u('text', '\n');
const space = () => u('text', ' ');

/** @type {(h: H, node: Code, value: string) => ReturnType<H>[]} */
const colorizePrompts = (h, node, value) => {
  const span = (className, value) => h(node, 'span', { class: className }, [text(value)]);
  const prompt = value => span('prompt', value);
  const blink = () => span('blink', ' ');

  return value
    .split('\n')
    .map(line => {
      if (line === '$') {
        return [prompt('$'), space(), blink(), newline()];
      }
      if (line.startsWith('$')) {
        return [prompt('$'), text(line.slice(1)), newline()];
      }
      if (line.startsWith('lars')) {
        let [user, dir, branch, sign, ...command] = line.split(' ');
        let chunks = [span('user', user), space(), span('dir', dir), space()];
        if (branch.length > 1) {
          chunks = [...chunks, span('branch', branch), space()];
        } else {
          command = [sign, ...command];
          sign = branch;
        }
        return [...chunks, prompt(sign), space(), text(command.join(' ')), newline()];
      }
      return [u('text', line), newline()];
    })
    .flat();
};

/** @type {(h: H, node: Code) => ReturnType<H>} */
const buildShell = (h, node) => {
  const meta = node.meta ? Object.fromEntries(node.meta.split(';').map(value => value.split('='))) : {};
  const value = node.value ? node.value : '';

  const title = meta.title ? h(node, 'div', { class: 'title' }, [u('text', meta.title)]) : null;
  const buttons = h(node, 'div', { class: 'buttons' }, [
    h(node, 'div', { class: 'button close' }),
    h(node, 'div', { class: 'button minimize' }),
    h(node, 'div', { class: 'button zoom' }),
  ]);
  const header = h(node, 'div', { class: 'header' }, title ? [buttons, title, buttons] : [buttons]);

  const content = colorizePrompts(h, node, value);
  const code = h(node, 'code', content);
  const pre = h(node, 'pre', [code]);

  return h(node.position, 'section', { class: 'terminal' }, [header, pre]);
};

/** @type {Handler} */
export const code = (h, node) => {
  const value = node.value ? node.value + '\n' : '';
  const language = node.lang;

  if (language === 'shell') {
    return buildShell(h, node);
  }

  if (!language || /te?xt/.test(language)) {
    const code = h(node, 'code', { className: ['no-highlight'] }, [u('text', value)]);
    return h(node.position, 'pre', [code]);
  }

  const props = {
    class: `language-${language}`,
  };

  const code = h(node, 'code', props, [u('text', value)]);

  if (node.meta) {
    code.data = { meta: node.meta };
  }

  return h(node.position, 'pre', [code]);
};
