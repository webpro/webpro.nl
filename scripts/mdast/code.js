import util from 'util';
import { u } from 'unist-builder';

const debug = util.debuglog('code');

const t = text => u('text', text);
const n = () => u('text', '\n');
const s = () => u('text', ' ');

const colorizePrompts = (h, node, value) => {
  const lines = value.split('\n');
  const colorized = lines.map(line => {
    if (line === '$') {
      return [h(node, 'span', { class: 'prompt' }, [t('$')]), s(), h(node, 'span', { class: 'blink' }, [s()]), n()];
    }
    if (line.startsWith('$')) {
      return [h(node, 'span', { class: 'prompt' }, [t('$')]), t(line.slice(1)), n()];
    }
    if (line.startsWith('lars')) {
      let [user, dir, branch, prompt, ...command] = line.split(' ');
      let chunks = [
        h(node, 'span', { class: 'user' }, [t(user)]),
        s(),
        h(node, 'span', { class: 'dir' }, [t(dir)]),
        s(),
      ];
      if (branch.length > 1) {
        chunks = [...chunks, h(node, 'span', { class: 'branch' }, [t(branch)]), s()];
      } else {
        command = [prompt, ...command];
        prompt = branch;
      }
      return [...chunks, h(node, 'span', { class: 'prompt' }, [t(prompt)]), s(), t(command.join(' ')), n()];
    }
    return [u('text', line), n()];
  });
  return colorized.flat();
};

const buildShell = (h, node) => {
  const meta = node.meta ? Object.fromEntries(node.meta.split(';').map(i => i.split('='))) : {};
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

/**
 * @type {Handler}
 * @param {hastscript} h
 * @param {Code} node
 */
export function code(h, node) {
  debug(node);

  const value = node.value ? node.value + '\n' : '';

  const lang = node.lang;

  if (lang === 'shell') {
    return buildShell(h, node);
  }

  if (!lang || /te?xt/.test(lang)) {
    const code = h(node, 'code', { className: ['no-highlight'] }, [u('text', value)]);
    return h(node.position, 'pre', [code]);
  }

  debug(node.meta && node.meta.split(';').map(i => i.split('=')));

  const meta = node.meta ? Object.fromEntries(node.meta.split(';').map(i => i.split('='))) : {};

  debug(meta);

  const props = {
    class: `language-${lang}`,
  };

  const code = h(node, 'code', props, [u('text', value)]);

  if (node.meta) {
    code.data = { meta: node.meta };
  }

  return h(node.position, 'pre', [code]);
}
