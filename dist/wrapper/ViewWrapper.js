import { TDPApplicationUtils } from '../utils/TDPApplicationUtils';
import { ViewUtils } from '../views/ViewUtils';
import { AView } from '../views/AView';
import { TourUtils } from '../tour/TourUtils';
import { EventHandler } from '../base';
import { NodeUtils, ObjectRefUtils } from '../clue/provenance';
import { I18nextManager } from '../i18n';
import { IDTypeManager } from '../idtype';
import { Dialog } from '../components';
export class ViewWrapper extends EventHandler {
    constructor(plugin, graph, document, viewOptionGenerator = () => ({})) {
        super();
        this.plugin = plugin;
        this.graph = graph;
        this.viewOptionGenerator = viewOptionGenerator;
        this.instance = null; // lazy
        this.instancePromise = null;
        this.listenerItemSelect = (_event, oldSelection, newSelection, name = AView.DEFAULT_SELECTION_NAME) => {
            this.fire(AView.EVENT_ITEM_SELECT, oldSelection, newSelection, name);
        };
        // caches before the instance exists but things are set
        this.preInstanceItemSelections = new Map();
        this.preInstanceParameter = new Map();
        this.inputSelections = new Map();
        this.preInstanceItemSelections.set(AView.DEFAULT_SELECTION_NAME, { idtype: null, ids: [] });
        this.node = document.createElement('article');
        this.node.classList.add('tdp-view-wrapper');
        this.allowed = ViewUtils.canAccess(plugin);
        this.node.innerHTML = `
    <header>
      <div class="parameters container-fluid ps-0 pe-0"></div>
    </header>
    <main></main>
    <div class="preview-image">
      <div></div>
      <span>${!this.allowed ? TDPApplicationUtils.notAllowedText(plugin.securityNotAllowedText) : this.selectionText(plugin.selection, plugin.idtype)}</span>
    </div>`;
        this.node.classList.add('view', 'disabled-view');
        this.content = this.node.querySelector('main');
        this.node.classList.toggle('not-allowed', !this.allowed);
        if (plugin.helpText) {
            this.node.insertAdjacentHTML('beforeend', `<a href="#" target="_blank" rel="noopener" class="view-help" title="${I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.showHelpLabel')}"><span class="visually-hidden">${I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.showHelp')}</span></a>`);
            this.node.lastElementChild.addEventListener('click', (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                const d = Dialog.generateDialog(plugin.name, I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.close'));
                d.body.innerHTML = plugin.helpText;
                d.show();
                d.hideOnSubmit();
            });
        }
        else if (plugin.helpUrl) {
            if (typeof plugin.helpUrl === 'string') {
                this.node.insertAdjacentHTML('beforeend', `<a href="${plugin.helpUrl}" target="_blank" rel="noopener" class="view-help" title="${I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.showHelpLabel')}"><span class="visually-hidden">${I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.showHelp')}</span></a>`);
            }
            else {
                // object version of helpUrl
                this.node.insertAdjacentHTML('beforeend', `<a href="${plugin.helpUrl.url}" target="_blank" rel="noopener" class="view-help" title="${plugin.helpUrl.title}"><span>${plugin.helpUrl.linkText}</span></a>`);
            }
        }
        else if (plugin.helpTourId) {
            this.node.insertAdjacentHTML('beforeend', `<a href="#" target="_blank" rel="noopener" class="view-help" title="${I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.showHelpTourLabel')}"><span class="visually-hidden">${I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.showHelpTour')}</span></a>`);
            this.node.lastElementChild.addEventListener('click', (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                TourUtils.startViewTour(plugin.helpTourId, {
                    plugin,
                    node: this.node,
                    instance: this.instance,
                    selection: this.inputSelections.get(AView.DEFAULT_SELECTION_NAME),
                });
            });
        }
        if (plugin.preview) {
            plugin.preview().then((previewImage) => {
                const image = this.node.querySelector('.preview-image > div');
                // eslint-disable-next-line @typescript-eslint/dot-notation
                image.style.backgroundImage = `url("${previewImage['default']}")`;
            });
        }
        this.ref = graph.findOrAddObject(ObjectRefUtils.objectRef(this, plugin.name, ObjectRefUtils.category.visual));
    }
    off(events, handler) {
        return super.on(events, handler);
    }
    on(events, handler) {
        return super.on(events, handler);
    }
    fire(events, ...args) {
        return super.fire(events, ...args);
    }
    set visible(visible) {
        const selection = this.inputSelections.get(AView.DEFAULT_SELECTION_NAME);
        if (visible) {
            this.node.removeAttribute('hidden');
        }
        else {
            this.node.toggleAttribute('hidden');
        }
        if (visible && this.instance == null && selection && this.match(selection)) {
            // lazy init
            this.createView(selection);
        }
        else {
            this.update(); // if the view was just created we don't need to call update again
        }
    }
    get visible() {
        return !this.node.hasAttribute('hidden');
    }
    /**
     * as needed for the lineup contract
     * @returns {any}
     */
    getInstance() {
        if (this.instance) {
            // lineup like I hope
            return this.instance;
        }
        return null;
    }
    createView(selection) {
        if (!this.allowed) {
            return null;
        }
        return this.plugin.load().then((p) => {
            if (this.instance) {
                return null; // already built race condition
            }
            // create provenance reference
            this.context = ViewUtils.createContext(this.graph, this.plugin, this.ref);
            this.instance = p.factory(this.context, selection, this.content, this.viewOptionGenerator());
            this.fire(ViewWrapper.EVENT_VIEW_CREATED, this.instance, this);
            return (this.instancePromise = Promise.resolve(this.instance.init(this.node.querySelector('header div.parameters'), this.onParameterChange.bind(this))).then(() => {
                this.inputSelections.forEach((v, k) => {
                    if (k !== AView.DEFAULT_SELECTION_NAME) {
                        // already handled
                        this.instance.setInputSelection(v, k);
                    }
                });
                const idType = this.instance.itemIDType;
                if (idType) {
                    const sel = this.preInstanceItemSelections.get(AView.DEFAULT_SELECTION_NAME);
                    if (sel.idtype) {
                        this.instance.setItemSelection(sel);
                    }
                    else {
                        this.instance.setItemSelection({
                            idtype: idType,
                            ids: idType.selections(),
                        });
                    }
                }
                this.preInstanceItemSelections.forEach((v, k) => {
                    if (k !== AView.DEFAULT_SELECTION_NAME) {
                        // already handed
                        this.instance.setItemSelection(v, k);
                    }
                });
                this.instance.on(AView.EVENT_ITEM_SELECT, this.listenerItemSelect);
                this.preInstanceParameter.forEach((value, key) => {
                    this.instance.setParameter(key, value);
                });
                this.preInstanceParameter.clear();
                this.fire(ViewWrapper.EVENT_VIEW_INITIALIZED, this.instance, this);
                return this.instance;
            }));
        });
    }
    destroy() {
        if (this.instance) {
            this.destroyInstance();
        }
        else if (this.instancePromise) {
            this.instancePromise.then(() => this.destroyInstance());
        }
        this.node.remove();
    }
    matchesIDType(idType) {
        const selection = this.inputSelections.get(AView.DEFAULT_SELECTION_NAME);
        if (selection) {
            return selection.idtype === idType;
        }
        const p = this.plugin;
        return (p.idtype ? new RegExp(p.idtype) : /.*/).test(idType.id);
    }
    get idType() {
        const selection = this.inputSelections.get(AView.DEFAULT_SELECTION_NAME);
        return selection && selection.idtype ? selection.idtype : ViewWrapper.guessIDType(this.plugin); // TODO: better IDType strategy than guessIDType?
    }
    destroyInstance() {
        this.fire(ViewWrapper.EVENT_VIEW_DESTROYED, this.instance, this);
        this.instance.destroy();
        this.content.innerHTML = '';
        this.node.querySelector('header div.parameters').innerHTML = '';
        this.instance.off(AView.EVENT_ITEM_SELECT, this.listenerItemSelect);
        this.instance = null;
        this.instancePromise = null;
    }
    onParameterChange(name, value, previousValue, isInitialization) {
        if (isInitialization) {
            if (NodeUtils.createdBy(this.ref)) {
                // executing during replay
                return undefined;
            }
            return this.context.graph.pushWithResult(TDPApplicationUtils.setParameter(this.ref, name, value, previousValue), {
                inverse: TDPApplicationUtils.setParameter(this.ref, name, previousValue, value),
            });
        }
        return this.context.graph.push(TDPApplicationUtils.setParameter(this.ref, name, value, previousValue));
    }
    getParameter(name) {
        if (this.instance) {
            return this.instance.getParameter(name);
        }
        return this.preInstanceParameter.get(name);
    }
    setParameterImpl(name, value) {
        if (this.instance) {
            return this.instance.setParameter(name, value);
        }
        this.preInstanceParameter.set(name, value);
        return null;
    }
    /**
     * @deprecated use setInputSelection instead
     */
    setParameterSelection(selection) {
        return this.setInputSelection(selection);
    }
    setInputSelection(selection, name = AView.DEFAULT_SELECTION_NAME) {
        const current = this.inputSelections.get(name);
        const isDefault = name === AView.DEFAULT_SELECTION_NAME;
        if (ViewUtils.isSameSelection(current, selection)) {
            return undefined;
        }
        this.inputSelections.set(name, selection);
        if (selection && isDefault) {
            this.node.dataset.idtype = selection.idtype.id;
        }
        const matches = selection && (!isDefault || this.match(selection));
        this.node.classList.toggle('disabled-view', !this.allowed || !matches);
        if (this.instance) {
            if (matches) {
                return this.instance.setInputSelection(selection, name);
            }
            this.destroyInstance();
        }
        else if (this.instancePromise) {
            return this.instancePromise.then(() => {
                if (matches) {
                    return this.instance.setInputSelection(selection, name);
                }
                this.destroyInstance();
                return undefined;
            });
        }
        else if (matches && this.visible) {
            return this.createView(selection);
        }
        return undefined;
    }
    match(selection) {
        var _a;
        return ViewUtils.matchLength(this.plugin.selection, ((_a = selection.ids) === null || _a === void 0 ? void 0 : _a.length) || 0);
    }
    /**
     * @deprecated use getInputSelection instead
     */
    getParameterSelection() {
        return this.getInputSelection();
    }
    getInputSelection(name = AView.DEFAULT_SELECTION_NAME) {
        return this.inputSelections.get(name);
    }
    get itemIDType() {
        return this.instance ? this.instance.itemIDType : null;
    }
    getItemSelection(name = AView.DEFAULT_SELECTION_NAME) {
        if (this.instance) {
            return this.instance.getItemSelection(name);
        }
        return this.preInstanceItemSelections.get(name);
    }
    setItemSelection(sel, name = AView.DEFAULT_SELECTION_NAME) {
        if (this.instance) {
            this.instancePromise.then((v) => {
                v.off(AView.EVENT_ITEM_SELECT, this.listenerItemSelect);
                v.setItemSelection(sel, name);
                v.on(AView.EVENT_ITEM_SELECT, this.listenerItemSelect);
            });
            return;
        }
        this.preInstanceItemSelections.set(name, sel);
    }
    update() {
        if (this.visible && this.instance && typeof this.instance.forceUpdate === 'function') {
            this.instance.forceUpdate();
        }
    }
    dumpReference() {
        return this.ref.id;
    }
    dump() {
        return {
            hash: this.ref.hash,
            dumpReference: this.dumpReference(),
            plugin: this.plugin.id,
            parameters: [], // TODO:
        };
    }
    selectionText(selection, idType) {
        const label = idType.includes('*') || idType.includes('(') ? 'item' : IDTypeManager.getInstance().resolveIdType(idType).name;
        switch (String(selection)) {
            case '':
            case 'none':
            case '0':
                return I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.selectionTextNone', { label });
            case 'any':
                return I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.selectionTextAny', { label });
            case 'single':
            case '1':
                return I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.selectionTextOne', { label });
            case 'small_multiple':
            case 'multiple':
            case 'some':
            case 'chooser':
                return I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.selectionTextMultiple', { label });
            case '2':
                return I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.selectionTextTwo', { label });
            default:
                console.error('unknown selector: ', selection, idType);
                return I18nextManager.getInstance().i18n.t('tdp:core.ViewWrapper.selectionTextDefault', { selection });
        }
    }
    static guessIDType(v) {
        return v.idtype ? (v.idtype.includes('*') ? null : IDTypeManager.getInstance().resolveIdType(v.idtype)) : null;
    }
}
ViewWrapper.EVENT_VIEW_INITIALIZED = 'viewInitialized';
ViewWrapper.EVENT_VIEW_CREATED = 'viewCreated';
ViewWrapper.EVENT_VIEW_DESTROYED = 'viewDestroyed';
//# sourceMappingURL=ViewWrapper.js.map