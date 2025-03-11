import merge from 'lodash/merge';
import { I18nextManager } from 'visyn_core/i18n';
import { IDTypeManager } from 'visyn_core/idtype';
import { AD3View } from './AD3View';
import { RestBaseUtils } from '../base/rest';
import { FormElementType } from '../form/interfaces';
/**
 * helper view for proxying an existing external website using an iframe
 */
export class ProxyView extends AD3View {
    constructor(context, selection, parent, options = {}) {
        super(context, selection, parent);
        this.options = {
            /**
             * proxy key - will be redirected through a local server proxy
             */
            proxy: null,
            /**
             * direct loading of an iframe site
             */
            site: null,
            /**
             * within the url {argument} will be replaced with the current selected id
             */
            argument: 'gene',
            /**
             * idtype of the argument
             */
            idtype: null,
            extra: {},
            openExternally: false,
        };
        this.naturalSize = [1280, 800];
        merge(this.options, context.desc, options);
        this.$node.classed('proxy_view', true);
        this.openExternally = parent.ownerDocument.createElement('p');
    }
    async init(params, onParameterChange) {
        const initResult = await super.init(params, onParameterChange);
        // inject stats
        const base = params.querySelector('form') || params;
        base.insertAdjacentHTML('beforeend', `<div class="col"></div>`);
        base.lastElementChild.appendChild(this.openExternally);
        return initResult;
    }
    initImpl() {
        super.initImpl();
        // update the selection first, then update the proxy view
        return this.updateSelectedItemSelect().then(() => {
            this.updateProxyView();
        });
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
    getParameterFormDescs() {
        return super.getParameterFormDescs().concat([
            {
                type: FormElementType.SELECT,
                label: 'Show',
                id: ProxyView.FORM_ID_SELECTED_ITEM,
                options: {
                    optionsData: [],
                },
                useSession: true,
            },
        ]);
    }
    parameterChanged(name) {
        super.parameterChanged(name);
        this.updateProxyView();
    }
    selectionChanged() {
        super.selectionChanged();
        // update the selection first, then update the proxy view
        this.updateSelectedItemSelect(true) // true = force use last selection
            .then(() => {
            this.updateProxyView();
        });
    }
    updateSelectedItemSelect(forceUseLastSelection = false) {
        return this.resolveSelection()
            .then((names) => Promise.all([names, this.getSelectionSelectData(names)]))
            .then((args) => {
            const names = args[0]; // use names to get the last selected element
            const data = args[1];
            const selectedItemSelect = this.getParameterElement(ProxyView.FORM_ID_SELECTED_ITEM);
            // backup entry and restore the selectedIndex by value afterwards again,
            // because the position of the selected element might change
            const bak = selectedItemSelect.value || data[selectedItemSelect.getSelectedIndex()];
            selectedItemSelect.updateOptionElements(data);
            // select last item from incoming `selection.range`
            if (forceUseLastSelection) {
                selectedItemSelect.value = data.filter((d) => d.value === names[names.length - 1])[0];
                // otherwise try to restore the backup
            }
            else if (bak !== null) {
                selectedItemSelect.value = bak;
            }
            // just show if there is more than one
            selectedItemSelect.setVisible(data.length > 1);
        });
    }
    getSelectionSelectData(names) {
        if (names === null) {
            return Promise.resolve([]);
        }
        // hook
        return Promise.resolve(names.map((d) => ({ value: d, name: d, data: d })));
    }
    updateProxyView() {
        this.loadProxyPage(this.getParameter(ProxyView.FORM_ID_SELECTED_ITEM).value);
    }
    loadProxyPage(selectedItemId) {
        if (selectedItemId === null) {
            this.showErrorMessage(selectedItemId);
            return;
        }
        // remove old mapping error notice if any exists
        this.openExternally.innerHTML = '';
        this.$node.selectAll('p').remove();
        this.$node.selectAll('iframe').remove();
        this.setBusy(true);
        const args = merge(this.options.extra, { [this.options.argument]: selectedItemId });
        const url = this.createUrl(args);
        if (ProxyView.isNoNSecurePage(url)) {
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
        // console.log('start loading', this.$node.select('iframe').node().getBoundingClientRect());
        this.$node
            .append('iframe')
            .attr('src', url)
            .on('load', () => {
            this.setBusy(false);
            // console.log('finished loading', this.$node.select('iframe').node().getBoundingClientRect());
            this.fire(ProxyView.EVENT_LOADING_FINISHED);
        });
    }
    showErrorMessage(selectedItemId) {
        this.setBusy(false);
        const to = this.options.idtype
            ? IDTypeManager.getInstance().resolveIdType(this.options.idtype).name
            : I18nextManager.getInstance().i18n.t('tdp:core.views.unknown');
        this.$node.html(`<p>${I18nextManager.getInstance().i18n.t('tdp:core.views.cannotMap', { name: this.selection.idtype.name, selectedItemId, to })}</p>`);
        this.openExternally.innerHTML = ``;
        this.fire(ProxyView.EVENT_LOADING_FINISHED);
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
        this.$node.html(`
    <div class="alert alert-info mx-auto" role="alert">${I18nextManager.getInstance().i18n.t('tdp:core.views.proxyPageCannotBeShownHere')}
    <a href="${url}" target="_blank" rel="noopener" class="alert-link">${url}</a>
    </div>`);
        this.openExternally.innerHTML = ``;
        this.fire(ProxyView.EVENT_LOADING_FINISHED);
    }
    static create(context, selection, parent, options = {}) {
        return new ProxyView(context, selection, parent, options);
    }
}
ProxyView.FORM_ID_SELECTED_ITEM = 'externalItem';
//# sourceMappingURL=ProxyView.js.map