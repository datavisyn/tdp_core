import { BaseUtils } from '../base/BaseUtils';
export class PopupProxy {
    constructor(parent, factory, options = {}) {
        this.parent = parent;
        this.factory = factory;
        this.options = {
            args: [],
            name: `${self.document.title} PopUp ${BaseUtils.randomId(3)}`
        };
        this.handler = {};
        this.options = BaseUtils.mixin(this.options, options);
        this.build(this.parent);
    }
    build(parent) {
        this.current = this.factory(parent, ...this.options.args);
    }
    buildPopup(callbackFunction) {
        const serializer = new XMLSerializer();
        const links = Array.from(document.head.querySelectorAll('link')).map((link) => `<link href="${link.href}" rel="${link.rel}" type="${link.type}" />`);
        const template = `<!doctype html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>${this.options.name}</title>
          <meta name="description" content="">
          <meta name="viewport" content="width=device-width">
          <script src="//cdn.polyfill.io/v2/polyfill.min.js"></script>
          ${links.join('\n')}
      </head>
      <body>
          <main id="popup-content" style="width: 100%; height: 100%"></main>
          <script>
            if ('${callbackFunction}' in window.opener) {
              window.opener.${callbackFunction}(document.getElementById('popup-content'));
            }
          </script>
      </body>
    </html>`;
        const blob = new Blob([template], { type: 'text/html' });
        return URL.createObjectURL(blob);
    }
    get proxy() {
        return new Proxy({}, this.handler);
    }
    close() {
        if (this.current.destroy) {
            this.current.destroy();
        }
        else {
            this.current.node.remove();
        }
        this.current = null;
        this.parent.classList.remove('as-popup');
        this.build(this.parent);
    }
    open() {
        const rect = this.current.node.getBoundingClientRect();
        if (this.current.destroy) {
            this.current.destroy();
        }
        else {
            this.current.node.remove();
        }
        this.parent.classList.add('as-popup');
        this.current = null;
        // use a callback function similar to jsonp, don't know why the popup state if overridden
        const name = 'popupCallback' + BaseUtils.randomId(8);
        window[name] = (popupBody) => {
            this.build(popupBody);
            delete window[name];
        };
        this.popup = self.open(this.buildPopup(name), this.options.name, `width=${rect.width}, height=${rect.height}, left=${rect.left}, top=${rect.top}, location=no`);
        this.popup.onbeforeunload = () => this.close();
    }
}
//# sourceMappingURL=PopupWindow.js.map