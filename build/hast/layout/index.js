import { html } from 'markdown-rambler';
import { footer } from './footer.js';

/**
 * @typedef {import('markdown-rambler').Meta} Meta
 */

/**  @type {import('markdown-rambler').Meta['layout']} */
export default (node, meta) => {
  const { logo } = meta;
  return html`
    <header>
      <div class="logo">
        <a href="${logo.href}" title="Go back">
          <img src="${logo.src}" width="32" height="32" alt="${logo.alt}" />
        </a>
      </div>
      <input type="search" id="search" placeholder="Search..." autocomplete="off" />
      <label class="theme-switch" for="theme-toggle">
        <button type="button" id="theme-toggle" role="switch" aria-label="Switch color theme" aria-checked="false" />
      </label>
    </header>
    <main ${meta.class ? `class=${meta.class}` : ''}>${node}</main>
    <footer>${footer(meta)}</footer>
    <button class="back-to-top">Back to top</button>
  `;
};
