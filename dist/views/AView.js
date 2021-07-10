/**
 * Created by Samuel Gratzl on 29.01.2016.
 */
import { select } from 'd3';
import { EventHandler, IDTypeManager, Range, I18nextManager, SelectionUtils, WebpackEnv } from 'phovea_core';
import { FormBuilder } from '../form/FormBuilder';
import { AFormElement } from '../form/elements/AFormElement';
import { ViewUtils } from './ViewUtils';
import { ResolveUtils } from './ResolveUtils';
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
        this.itemSelections.set(AView.DEFAULT_SELECTION_NAME, { idtype: null, range: Range.none() });
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
            this.node.dataset.hint = hintMessage ? hintMessage : defaultHintMessage;
        }
    }
    setNoMappingFoundHint(visible, hintMessage) {
        const conditionalData = { ...this.selection.idtype ? { name: this.selection.idtype.name } : { context: 'unknown' }, id: this.idType ? this.idType.name : '' };
        return this.setHint(visible, hintMessage || I18nextManager.getInstance().i18n.t('tdp:core.views.noMappingFoundHint', { ...conditionalData }), 'hint-mapping');
    }
    /*final*/
    async init(params, onParameterChange) {
        this.params = await this.buildParameterForm(params, onParameterChange);
        return this.initImpl();
    }
    /**
     * hook for custom initialization
     */
    initImpl() {
        // hook
        return null;
    }
    buildParameterForm(params, onParameterChange) {
        const builder = new FormBuilder(select(params), undefined, 'row', true);
        //work on a local copy since we change it by adding an onChange handler
        const descs = this.getParameterFormDescs().map((d) => Object.assign({}, d));
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
    /*final*/
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
    /*final*/
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
            return;
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
        return ResolveUtils.resolveIds(this.selection.idtype, this.selection.range, idType);
    }
    /**
     * resolve the name of the current input selection
     * @returns {Promise<string[]>}
     */
    resolveSelectionByName(idType = this.idType) {
        return ResolveUtils.resolveNames(this.selection.idtype, this.selection.range, idType);
    }
    /**
     * resolve the ids of the current input selection to all 1:n related names, not just the first one like `resolveSelection` does
     * @returns {Promise<string[]>}
     */
    resolveMultipleSelections(idType = this.idType) {
        return ResolveUtils.resolveAllIds(this.selection.idtype, this.selection.range, idType);
    }
    /**
     * resolve the names of the current input selection to all 1:n related names, not just the first one like `resolveSelectionByName` does
     * @returns {Promise<string[]>}
     */
    resolveMultipleSelectionsByName(idType = this.idType) {
        return ResolveUtils.resolveAllNames(this.selection.idtype, this.selection.range, idType);
    }
    setItemSelection(selection, name = AView.DEFAULT_SELECTION_NAME) {
        const current = this.itemSelections.get(name);
        if (current && ViewUtils.isSameSelection(current, selection)) {
            return;
        }
        const wasEmpty = current == null || current.idtype == null || current.range.isNone;
        this.itemSelections.set(name, selection);
        // propagate
        if (selection.idtype) {
            if (name === AView.DEFAULT_SELECTION_NAME) {
                if (selection.range.isNone) {
                    selection.idtype.clear(SelectionUtils.defaultSelectionType);
                }
                else {
                    selection.idtype.select(selection.range);
                }
            }
            else {
                if (selection.range.isNone) {
                    selection.idtype.clear(name);
                }
                else {
                    selection.idtype.select(name, selection.range);
                }
            }
        }
        const isEmpty = selection == null || selection.idtype == null || selection.range.isNone;
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
        return this.itemSelections.get(name) || { idtype: null, range: Range.none() };
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