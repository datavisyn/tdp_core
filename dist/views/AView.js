import { select } from 'd3v3';
import { IDTypeManager, SelectionUtils } from 'visyn_core';
import { I18nextManager } from 'visyn_core';
import { EventHandler, WebpackEnv } from 'visyn_core';
import { FormBuilder } from '../form/FormBuilder';
import { AFormElement } from '../form/elements/AFormElement';
import { ViewUtils } from './ViewUtils';
import { ERenderAuthorizationStatus, TokenManager, TDPTokenManager } from '../auth';
/**
 * base class for all views
 */
export class AView extends EventHandler {
    constructor(context, selection, parent) {
        super();
        this.context = context;
        this.selection = selection;
        this.paramsFallback = new Map();
        this.shared = new Map();
        this.itemSelections = new Map();
        this.selections = new Map();
        this.selections.set(AView.DEFAULT_SELECTION_NAME, selection);
        this.itemSelections.set(AView.DEFAULT_SELECTION_NAME, { idtype: null, ids: [] });
        this.node = parent.ownerDocument.createElement('div');
        this.node.classList.add('tdp-view');
        parent.appendChild(this.node);
        if (this.isRegex(context.desc.idtype)) {
            this.idType = selection.idtype;
        }
        else {
            this.idType = IDTypeManager.getInstance().resolveIdType(context.desc.idtype);
        }
    }
    /**
     * helper to marks this view busy showing a loading icon
     * @param {boolean} value
     * @param {boolean|string} busyMessage optional loading message hint
     */
    setBusy(value, busyMessage) {
        this.node.classList.toggle('tdp-busy', value);
        if (!value || !busyMessage) {
            delete this.node.dataset.busy;
        }
        else if (busyMessage) {
            this.node.dataset.busy = typeof busyMessage === 'string' ? busyMessage : I18nextManager.getInstance().i18n.t('tdp:core.views.busyMessage');
        }
    }
    setHint(visible, hintMessage, hintCSSClass = 'hint') {
        const conditionalData = this.selection.idtype ? { name: this.selection.idtype.name } : { context: 'unknown' };
        const defaultHintMessage = I18nextManager.getInstance().i18n.t('tdp:core.views.defaultHint', { ...conditionalData });
        this.node.classList.toggle(`tdp-${hintCSSClass}`, visible);
        if (!visible) {
            delete this.node.dataset.hint;
        }
        else {
            this.node.dataset.hint = hintMessage || defaultHintMessage;
        }
    }
    setNoMappingFoundHint(visible, hintMessage) {
        const conditionalData = {
            ...(this.selection.idtype ? { name: this.selection.idtype.name } : { context: 'unknown' }),
            id: this.idType ? this.idType.name : '',
        };
        return this.setHint(visible, hintMessage || I18nextManager.getInstance().i18n.t('tdp:core.views.noMappingFoundHint', { ...conditionalData }), 'hint-mapping');
    }
    /* final */
    async init(params, onParameterChange) {
        TDPTokenManager.on(TokenManager.EVENT_AUTHORIZATION_REMOVED, async () => {
            // If a authorization is removed, rerun the registered authorizations
            await this.runAuthorizations();
        });
        // First, run all required authorizations
        await this.runAuthorizations();
        // Register listener after the authorizations are run to avoid double-initializations
        TDPTokenManager.on(TokenManager.EVENT_AUTHORIZATION_STORED, async (_, id, token) => {
            // TODO: Enabling this leads to the taggle view being loaded twice
            // await this.initImpl();
        });
        this.params = await this.buildParameterForm(params, onParameterChange);
        return this.initImpl();
    }
    /**
     * Uses the token manager to run the authorizations defined by `getAuthorizationConfiguration()`.
     * Only authorizations which are not yet stored in the token manager are run, others are skipped.
     * It will show an overlay over the detail view allowing the user to authorize the application.
     */
    async runAuthorizations() {
        await TDPTokenManager.runAuthorizations(await this.getAuthorizationConfiguration(), {
            render: ({ authConfiguration, status, error, trigger }) => {
                // Fetch or create the authorization overlay
                let overlay = this.node.querySelector('.tdp-authorization-overlay');
                if (!overlay) {
                    overlay = this.node.ownerDocument.createElement('div');
                    overlay.className = 'tdp-authorization-overlay';
                    // Add element at the very bottom to avoid using z-index
                    this.node.appendChild(overlay);
                }
                if (status === ERenderAuthorizationStatus.SUCCESS) {
                    overlay.remove();
                }
                else {
                    overlay.innerHTML = `
          ${error
                        ? `<div class="alert alert-info" role="alert">${I18nextManager.getInstance().i18n.t('tdp:core.views.authorizationFailed')} ${error.toString()}</div>`
                        : ''}
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                <p class="lead">${I18nextManager.getInstance().i18n.t('tdp:core.views.authorizationRequired', { name: authConfiguration.name })}</p>
                <button class="btn btn-primary" ${status === 'pending' ? `disabled` : ''}>${status === 'pending'
                        ? I18nextManager.getInstance().i18n.t('tdp:core.views.authorizationButtonLoading')
                        : I18nextManager.getInstance().i18n.t('tdp:core.views.authorizationButton')}</button>
            </div>`;
                    overlay.querySelector('button').onclick = async () => {
                        trigger();
                    };
                }
            },
        });
    }
    /**
     * Hook to override returning which authorizations are required for this view.
     * @returns ID(s) or authorization configurations(s) which are required. Defaults to the `authorization` desc entry.
     */
    async getAuthorizationConfiguration() {
        // hook
        return this.context.desc.authorization;
    }
    /**
     * hook for custom initialization
     */
    initImpl() {
        // hook
        return null;
    }
    buildParameterForm(params, onParameterChange) {
        const builder = new FormBuilder(select(params), undefined, true);
        // work on a local copy since we change it by adding an onChange handler
        const descs = this.getParameterFormDescs().map((d) => ({ ...d }));
        const onInit = onParameterChange;
        // map FormElement change function to provenance graph onChange function
        descs.forEach((p) => {
            p.onChange = (formElement, value, _data, previousValue) => onParameterChange(formElement.id, value, previousValue);
            if (onInit) {
                p.onInit = (formElement, value, _data, previousValue) => onInit(formElement.id, value, previousValue, true);
            }
        });
        this.paramsChangeListener = onParameterChange;
        builder.appendElements(descs);
        return builder.build();
    }
    /**
     * return a list of FormBuilder element descriptions to build the parameter form
     * @returns {IFormElementDesc[]}
     */
    getParameterFormDescs() {
        // hook
        return [];
    }
    getItemSelectionNames() {
        return Array.from(this.itemSelections.keys());
    }
    /**
     * finds the element form element based on the given id
     * @param {string} id
     * @returns {IFormElement}
     */
    getParameterElement(id) {
        return this.params.getElementById(id);
    }
    /**
     * returns the value of the given parameter
     */
    /* final */
    getParameter(name) {
        const elem = this.getParameterElement(name);
        if (!elem) {
            if (WebpackEnv.__DEBUG__ && this.params.length > 0) {
                console.warn('invalid parameter detected use fallback', name, this.context.desc);
            }
            return this.paramsFallback.has(name) ? this.paramsFallback.get(name) : null;
        }
        const v = elem.value;
        return v === null ? '' : v;
    }
    getParameterData(name) {
        const value = this.getParameter(name);
        return AFormElement.toData(value);
    }
    async changeParameter(name, value) {
        const old = this.getParameter(name);
        if (old === value) {
            return;
        }
        await this.paramsChangeListener(name, value, old);
        await this.setParameter(name, value);
    }
    /* final */
    setParameter(name, value) {
        const elem = this.getParameterElement(name);
        if (!elem) {
            if (WebpackEnv.__DEBUG__ && this.params.length > 0) {
                console.warn('invalid parameter detected use fallback', name, this.context.desc);
            }
            this.paramsFallback.set(name, value);
        }
        else {
            elem.value = value;
        }
        return this.parameterChanged(name);
    }
    updateShared(name, value) {
        if (this.shared.has(name) && this.shared.get(name) === value) {
            return;
        }
        const old = this.shared.get(name);
        this.shared.set(name, value);
        this.sharedChanged(name);
        this.fire(AView.EVENT_UPDATE_SHARED, name, old, value);
    }
    sharedChanged(_name) {
        // hook
    }
    getShared(name) {
        return this.shared.get(name);
    }
    /**
     * hook triggerd when the parameter has changed
     * @param {string} _name the name of the parameter
     */
    parameterChanged(_name) {
        // hook
    }
    setInputSelection(selection, name = AView.DEFAULT_SELECTION_NAME) {
        const current = this.selections.get(name);
        if (current && ViewUtils.isSameSelection(current, selection)) {
            return undefined;
        }
        this.selections.set(name, selection);
        if (name === AView.DEFAULT_SELECTION_NAME) {
            this.selection = selection;
        }
        return this.selectionChanged(name);
    }
    getInputSelection(name = AView.DEFAULT_SELECTION_NAME) {
        return this.selections.get(name);
    }
    getInputSelectionNames() {
        return Array.from(this.selections.keys());
    }
    /**
     * hook triggerd when the input selection has changed
     */
    selectionChanged(_name = AView.DEFAULT_SELECTION_NAME) {
        // hook
    }
    get itemIDType() {
        return this.getItemSelection().idtype;
    }
    /**
     * resolve the id of the current input selection
     * @returns {Promise<string[]>}
     */
    resolveSelection(idType = this.idType) {
        // return Promise.resolve(this.selection.ids);
        return IDTypeManager.getInstance().mapNameToFirstName(this.selection.idtype, this.selection.ids, idType);
    }
    setItemSelection(selection, name = AView.DEFAULT_SELECTION_NAME) {
        const current = this.itemSelections.get(name);
        if (current && ViewUtils.isSameSelection(current, selection)) {
            return;
        }
        const wasEmpty = current == null || current.idtype == null || current.ids.length === 0;
        this.itemSelections.set(name, selection);
        // propagate
        if (selection.idtype) {
            if (name === AView.DEFAULT_SELECTION_NAME) {
                if ((selection.ids?.length || 0) === 0) {
                    selection.idtype.clear(SelectionUtils.defaultSelectionType);
                }
                else {
                    selection.idtype.select(selection.ids);
                }
            }
            else if ((selection.ids?.length || 0) === 0) {
                selection.idtype.clear(name);
            }
            else {
                selection.idtype.select(name, selection.ids);
            }
        }
        const isEmpty = selection == null || selection.idtype == null || (selection.ids?.length || 0) === 0;
        if (!(wasEmpty && isEmpty)) {
            // the selection has changed when we really have some new values not just another empty one
            this.itemSelectionChanged(name);
        }
        this.fire(AView.EVENT_ITEM_SELECT, current, selection, name);
    }
    /**
     * hook when the item selection has changed
     */
    itemSelectionChanged(_name = AView.DEFAULT_SELECTION_NAME) {
        // hook
    }
    getItemSelection(name = AView.DEFAULT_SELECTION_NAME) {
        return this.itemSelections.get(name) || { idtype: null, ids: [] };
    }
    modeChanged(mode) {
        // hook
    }
    destroy() {
        this.node.remove();
    }
    isRegex(v) {
        // cheap test for regex
        return v.includes('*') || v.includes('.') || v.includes('|');
    }
}
AView.DEFAULT_SELECTION_NAME = 'default';
/**
 * params(oldValue: ISelection, newSelection: ISelection)
 */
AView.EVENT_ITEM_SELECT = ViewUtils.VIEW_EVENT_ITEM_SELECT;
/**
 * params(namedSet: INamedSet)
 */
AView.EVENT_UPDATE_ENTRY_POINT = ViewUtils.VIEW_EVENT_UPDATE_ENTRY_POINT;
/**
 * params()
 */
AView.EVENT_LOADING_FINISHED = ViewUtils.VIEW_EVENT_LOADING_FINISHED;
/**
 * params(name: string, oldValue: any, newValue: any)
 */
AView.EVENT_UPDATE_SHARED = ViewUtils.VIEW_EVENT_UPDATE_SHARED;
//# sourceMappingURL=AView.js.map