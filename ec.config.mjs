import { defineEcConfig } from 'astro-expressive-code';

const setForeground = (theme, scope, value) => {
  const settings = theme.settings.find(setting => setting.scope?.includes(scope));
  if (settings) settings.settings.foreground = value;
};

export default defineEcConfig({
  emitExternalStylesheet: true,
  styleOverrides: {
    codeFontFml: 'var(--code-font)',
    codeFontWg: 'var(--code-weight)',
    codeFontSize: 'var(--code-size)',
    brdRad: '6px',
    brdWd: '0px',
    uiFontSize: '2rem',
    'frm-edBg': 'var(--bg-color-code)',
    'frm-edActTabBg': 'var(--bg-color-code)',
    'frm-edActTabIndTopCol': 'var(--orange)',
    'frm-edTabBarBg': 'var(--dark-grey)',
    'frm-edTabBarBrdBtmCol': 'var(--black)',
    'frm-frameBoxShdCssVal': 0,
    'frm-tooltipSuccessBg': 'var(--orange)',
    'frm-tooltipSuccessFg': 'var(--white)',
  },
  frames: {
    showCopyToClipboardButton: true,
  },
  themes: ['slack-dark'],
  customizeTheme: theme => {
    setForeground(theme, 'entity.name.type', 'var(--orange)');
    setForeground(theme, 'string', '#ededed');
    return theme;
  },
});
