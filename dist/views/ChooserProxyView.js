import { AView } from './AView';
import { RestBaseUtils } from '../base/rest';
import { SelectionChooser } from './SelectionChooser';
import { I18nextManager } from '../i18n';
export class ChooserProxyView extends AView {
    constructor(context, selection, parent, options = {}) {
        super(context, selection, parent);
        this.options = {
            name: null,
            proxy: null,
            site: null,
            argument: 'gene',
            idtype: null,
            extra: {},
            openExternally: false,
        };
        this.naturalSize = [1280, 800];
        Object.assign(this.options, context.desc, options);
        this.chooser = new SelectionChooser((id) => this.getParameterElement(id), this.options.idtype, this.options);
        this.openExternally = parent.ownerDocument.createElement('p');
    }
    async init(params, onParameterChange) {
        const initResult = await super.init(params, onParameterChange);
        // inject stats
        const base = params.querySelector('form') || params;
        base.insertAdjacentHTML('beforeend', `<div class="col-sm-auto"></div>`);
        base.lastElementChild.appendChild(this.openExternally);
        return initResult;
    }
    initImpl() {
        super.initImpl();
        this.node.classList.add('proxy_view');
        return this.chooser.init(this.selection).then(() => {
            return this.build();
        });
    }
    getParameterFormDescs() {
        return super.getParameterFormDescs().concat([this.chooser.desc]);
    }
    selectionChanged() {
        super.selectionChanged();
        return this.chooser.update(this.selection).then(() => this.build());
    }
    parameterChanged(name) {
        super.parameterChanged(name);
        return this.build();
    }
    createUrl(args) {
        // use internal proxy
        if (this.options.proxy) {
            return RestBaseUtils.getProxyUrl(this.options.proxy, args);
        }
        if (this.options.site) {
            return this.options.site.replace(/{([^}]+)}/gi, (match, variable) => args[variable]);
        }
        return null;
    }
    build() {
        // remove old mapping error notice if any exists
        this.openExternally.innerHTML = '';
        this.node.innerHTML = '';
        this.setHint(false);
        this.setNoMappingFoundHint(false);
        const selectedItemId = this.chooser.chosen();
        if (selectedItemId == null) {
            const to = this.options.idtype ? I18nextManager.getInstance().i18n.t('tdp:core.views.toOption', { id: this.options.idtype }) : '';
            this.setNoMappingFoundHint(true, I18nextManager.getInstance().i18n.t('tdp:core.views.noMappingFound', { name: to }));
            return;
        }
        this.setBusy(true);
        const args = { ...this.options.extra, [this.options.argument]: selectedItemId.name };
        const url = this.createUrl(args);
        if (ChooserProxyView.isNoNSecurePage(url)) {
            this.showNoHttpsMessage(url);
            return;
        }
        if (this.options.openExternally) {
            this.setBusy(false);
            this.node.innerHTML = `<div class="alert alert-info mx-auto" role="alert">${I18nextManager.getInstance().i18n.t('tdp:core.views.proxyPageCannotBeShownHere')}
      <a href="${url}" target="_blank" rel="noopener" class="alert-link">${url}</a>
      </div>`;
            return;
        }
        this.openExternally.innerHTML = `${I18nextManager.getInstance().i18n.t('tdp:core.views.isLoaded')} <a href="${url}" target="_blank" rel="noopener"><i class="fas fa-external-link-alt"></i>${url.startsWith('http') ? url : `${window.location.protocol}${url}`}</a>`;
        const iframe = this.node.ownerDocument.createElement('iframe');
        iframe.src = url;
        iframe.onload = () => {
            this.setBusy(false);
            this.fire(ChooserProxyView.EVENT_LOADING_FINISHED);
        };
        this.node.appendChild(iframe);
    }
    showErrorMessage() {
        this.setBusy(false);
        this.node.innerHTML = `<p>${I18nextManager.getInstance().i18n.t('tdp:core.views.screwed')}</p>`;
        this.openExternally.innerHTML = ``;
        this.fire(ChooserProxyView.EVENT_LOADING_FINISHED);
    }
    static isNoNSecurePage(url) {
        const self = window.location.protocol.toLowerCase();
        if (!self.startsWith('https')) {
            return false; // if I'm not secure doesn't matter
        }
        return url.startsWith('http://');
    }
    showNoHttpsMessage(url) {
        this.setBusy(false);
        this.node.innerHTML = `
    <div class="alert alert-info mx-auto" role="alert">${I18nextManager.getInstance().i18n.t('tdp:core.views.proxyPageCannotBeShownHere')}
    <a href="${url}" target="_blank" rel="noopener" class="alert-link">${url}</a>
    </div>`;
        this.openExternally.innerHTML = ``;
        this.fire(ChooserProxyView.EVENT_LOADING_FINISHED);
    }
}
//# sourceMappingURL=ChooserProxyView.js.map