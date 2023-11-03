import { boot } from 'quasar/wrappers';

interface PaperOptions {
  name?: string;
  specs?: string[];
  styles?: string[];
  replace?: boolean;
  autoClose?: boolean;
  windowTitle?: string;
  timeout?: number;
}

interface HtmlToPaper {
  (
    id: string | HTMLElement,
    localOptions?: PaperOptions,
    callback?: () => void
  ): void | undefined;
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $elementToPrint: HtmlToPaper;
  }
}

const paperOptions: PaperOptions = {
  name: '_blank',
  specs: ['fullscreen=yes', 'titlebar=yes', 'scrollbars=yes'],
  styles: [
    'css/photoprint.css',
    // 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
    // 'https://unpkg.com/kidlat-css/css/kidlat.css',
  ],
  timeout: 1000, // default timeout before the print window appears
  autoClose: false, // if false, the window will not close after printing
  windowTitle: window.document.title, // override the window title
};

const convert = {
  mm2px: (v: number) => (v / 0.254) * 0.96,
  px2mm: (v: number) => (v * 0.254) / 0.96,
};

function addStyles(win: Window, styles: string[]) {
  styles.forEach((style) => {
    const link = win.document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', style);
    win.document.getElementsByTagName('head')[0].appendChild(link);
  });
}

function openWindow(url: string, name: string, props: string) {
  let windowRef = null;
  windowRef = window.open(url, name, props);
  if (windowRef) {
    if (!windowRef?.opener) {
      windowRef.opener = self;
    }
    windowRef?.focus();
    return windowRef;
  }
}

const elementToPrint = (
  el: string | HTMLElement,
  localOptions?: PaperOptions,
  cb?: () => void
) => {
  const defaultName = '_blank',
    defaultSpecs = ['fullscreen=yes', 'titlebar=yes', 'scrollbars=yes'],
    // defaultReplace = true,
    defaultWindowTitle = window.document.title;

  const defaultStyles: string[] = [];

  let {
    name = defaultName,
    specs = defaultSpecs,
    // replace = defaultReplace,
    styles = defaultStyles,
    autoClose = true,
    windowTitle = defaultWindowTitle,
  } = paperOptions;

  if (!!localOptions) {
    if (localOptions.name) name = localOptions.name;
    if (localOptions.specs) specs = localOptions.specs;
    // if (localOptions.replace) replace = localOptions.replace;
    if (localOptions.styles) styles = localOptions.styles;
    if (localOptions.autoClose === false) autoClose = localOptions.autoClose;
    if (localOptions.windowTitle) windowTitle = localOptions.windowTitle;
  }

  const ospecs = !!specs.length ? specs.join(',') : '';

  const element =
    typeof el === 'string' ? window.document.getElementById(el) : el;

  if (!element) {
    alert(`Element to print #${el} not found!`);
  } else {
    const url = '';
    const win = openWindow(url, name, ospecs);

    win?.document.write(`
      <html>
        <head>
          <title>${windowTitle || window.document.title}</title>
        </head>
        <body class="printpaper">
          ${element.innerHTML}
        </body>
      </html>
    `);

    if (win) addStyles(win, styles);

    setTimeout(() => {
      win?.focus();
      win?.print();
      if (autoClose) {
        setTimeout(function () {
          win?.close();
        }, 1);
      }
      if (cb) cb();
    }, 1000);
  }
};

export default boot(({ app }) => {
  app.config.globalProperties.$elementToPrint = elementToPrint;
});

export { convert, elementToPrint, paperOptions };
