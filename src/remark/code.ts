import { u } from 'unist-builder';
import type { H } from 'mdast-util-to-hast';
import type { Element } from 'hast';
import type { Code } from 'mdast';

const text = (text: string) => u('text', text);
const newline = () => u('text', '\n');
const space = () => u('text', ' ');

const colorizePrompts = (state: H, node: Code, value: string) => {
  const span = (className: string, value: string) => state(node, 'span', { class: className }, [text(value)]);
  const prompt = (value: string) => span('prompt', value);
  const blink = () => span('blink', ' ');

  return value
    .split('\n')
    .map((line: string) => {
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
        return [...chunks, prompt(sign), space(), text(command.join(' ')), blink(), newline()];
      }
      return [u('text', line), newline()];
    })
    .flat();
};

const buildShell = (state: H, node: Code) => {
  const meta = node.meta ? Object.fromEntries(node.meta.split(';').map(value => value.split('='))) : {};
  const value = node.value ? node.value : '';

  const title = meta.title ? state(node, 'div', { class: 'title' }, [u('text', meta.title)]) : null;
  const buttons = state(node, 'div', { class: 'buttons' }, [
    state(node, 'div', { class: 'button close' }),
    state(node, 'div', { class: 'button minimize' }),
    state(node, 'div', { class: 'button zoom' }),
  ]);
  const header = state(node, 'div', { class: 'header' }, title ? [buttons, title, buttons] : [buttons]);

  const content = colorizePrompts(state, node, value);
  const code = state(node, 'code', { className: ['language-shell'] }, content);
  const pre = state(node, 'pre', { tabIndex: 0 }, [code]);

  return state(node.position, 'section', { class: 'terminal' }, [header, pre]);
};

export const code = (state: H, node: Code): Element | undefined => {
  if (node.lang === 'shell') return buildShell(state, node);
};
