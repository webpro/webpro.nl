const html = document.documentElement;
const classList = html.classList;
const toggle = document.querySelector('#theme-toggle');
const preferDark = window.matchMedia('(prefers-color-scheme: dark)');
const highlightSheet = document.querySelector('link[href*=hljs]');
const highlightSheets = {
  light: '/css/hljs.github.min.css',
  dark: '/css/hljs.github-dark-dimmed.min.css',
};

toggle.addEventListener('click', () => {
  const isChecked = toggle.getAttribute('aria-checked') !== 'true';
  const theme = isChecked ? 'light' : 'dark';
  classList.remove(isChecked ? 'dark' : 'light');
  classList.add(theme);
  localStorage.setItem('theme', theme);
  if (highlightSheet) highlightSheet.href = highlightSheets[theme];
  toggle.setAttribute('aria-checked', isChecked);
});

preferDark.addEventListener('change', event => {
  if (!localStorage.getItem('theme')) {
    toggle.setAttribute('aria-checked', !event.matches);
  }
});

if (html.classList.contains('light') || !preferDark.matches) {
  toggle.setAttribute('aria-checked', true);
}

html.classList.add('js');
