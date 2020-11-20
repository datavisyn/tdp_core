/**
 * Created by Samuel Gratzl on 08.03.2017.
 */
import 'select2';
import { event as d3event } from 'd3';
import $ from 'jquery';
import { AFormElement } from './AFormElement';
import { FormElementType } from '../interfaces';
import { FormSelect } from './FormSelect';
import { FormSelect2 } from './FormSelect2';
import { BaseUtils, UserSession, ResolveNow, I18nextManager } from 'phovea_core';
import { Select3 } from './Select3';
function hasInlineParent(node) {
    while (node.parentElement) {
        node = node.parentElement;
        if (node.classList.contains('parameters')) {
            return node.classList.contains('form-inline');
        }
    }
    return false;
}
export class FormMap extends AFormElement {
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form, elementDesc, pluginDesc) {
        super(form, elementDesc, pluginDesc);
        this.pluginDesc = pluginDesc;
        this.rows = [];
    }
    updateBadge() {
        const dependent = (this.elementDesc.dependsOn || []).map((id) => this.form.getElementById(id));
        ResolveNow.resolveImmediately(this.elementDesc.options.badgeProvider(this.value, ...dependent)).then((text) => {
            this.$node.select('span.badge').html(text).attr('title', I18nextManager.getInstance().i18n.t('tdp:core.FormMap.badgeTitle', { text }));
        });
    }
    get sessionKey() {
        return `formBuilder.map.${this.id}${this.elementDesc.options.sessionKeySuffix || ''}`;
    }
    updateStoredValue() {
        if (!this.elementDesc.useSession) {
            return;
        }
        UserSession.getInstance().store(this.sessionKey, this.value);
    }
    getStoredValue(defaultValue) {
        if (!this.elementDesc.useSession) {
            return defaultValue;
        }
        return UserSession.getInstance().retrieve(this.sessionKey, defaultValue);
    }
    /**
     * Build the label and input element
     * @param $formNode The parent node this element will be attached to
     */
    build($formNode) {
        this.addChangeListener();
        this.$node = $formNode.append('div').classed('form-group', true);
        this.setVisible(this.elementDesc.visible);
        this.inline = hasInlineParent(this.$node.node());
        if (this.inline && this.elementDesc.onChange) {
            //change the default onChange handler for the inline cas
            this.inlineOnChange = this.elementDesc.onChange;
            this.elementDesc.onChange = null;
        }
        if (this.inline) {
            if (!this.elementDesc.options.badgeProvider) {
                //default badge provider for inline
                this.elementDesc.options.badgeProvider = (rows) => rows.length === 0 ? '' : rows.length.toString();
            }
            this.$node.classed('dropdown', true);
            this.$node.html(`
          <button class="btn btn-default dropdown-toggle" type="button" id="${this.elementDesc.attributes.id}l" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
            ${this.elementDesc.label}
            <span class="badge"></span>
            <span class="caret"></span>
          </button>
          <div class="dropdown-menu" aria-labelledby="${this.elementDesc.attributes.id}l" style="min-width: 25em">
            <div class="form-horizontal"></div>
            <div>
                <button class="btn btn-default btn-sm right">${I18nextManager.getInstance().i18n.t('tdp:core.FormMap.apply')}</button>
            </div>
          </div>
      `);
            this.$node.select('button.right').on('click', () => {
                d3event.preventDefault();
            });
            this.$group = this.$node.select('div.form-horizontal');
            this.$group.on('click', () => {
                // stop click propagation to avoid closing the dropdown
                d3event.stopPropagation();
            });
        }
        else {
            if (!this.elementDesc.hideLabel) {
                const $label = this.$node.append('label').attr('for', this.elementDesc.attributes.id);
                if (this.elementDesc.options.badgeProvider) {
                    $label.html(`${this.elementDesc.label} <span class="badge"></span>`);
                }
                else {
                    $label.text(this.elementDesc.label);
                }
            }
            this.$group = this.$node.append('div');
        }
        this.setAttributes(this.$group, this.elementDesc.attributes);
        // adapt default settings
        this.$group.classed('form-horizontal', true).classed('form-control', false).classed('form-group-sm', true);
    }
    /**
     * Bind the change listener and propagate the selection by firing a change event
     */
    init() {
        super.init();
        this.rows = this.getStoredValue([]);
        this.previousValue = this.value;
        if (this.elementDesc.options.badgeProvider) {
            this.updateBadge();
            this.on('change', () => {
                this.updateBadge();
            });
        }
        this.handleDependent(() => {
            this.rows = []; // clear old
            this.buildMap();
            if (this.elementDesc.options.badgeProvider) {
                this.updateBadge();
            }
        });
        this.buildMap();
        if (this.inline && this.inlineOnChange) {
            // trigger change on onChange listener just when the dialog is closed
            $(this.$node.node()).on('hidden.bs.dropdown', () => {
                const v = this.value;
                const previous = this.previousValue;
                if (this.isEqual(v, previous)) {
                    return;
                }
                this.previousValue = v;
                this.inlineOnChange(this, v, AFormElement.toData(v), previous);
            });
        }
        {
            const v = this.value;
            if (v.length > 0) {
                this.fire(FormMap.EVENT_INITIAL_VALUE, v, []);
            }
        }
    }
    addValueEditor(row, parent, entries) {
        const that = this;
        const desc = entries.find((d) => d.value === row.key);
        const defaultSelection = this.elementDesc.options.defaultSelection !== false;
        function mapOptions(d) {
            const value = typeof d === 'string' || !d ? d : (d.value || d.id);
            const name = typeof d === 'string' || !d ? d : (d.name || d.text);
            return `<option value="${value}">${name}</option>`;
        }
        const initialValue = row.value;
        switch (desc.type) {
            case FormElementType.SELECT:
                parent.insertAdjacentHTML('afterbegin', `<select class="form-control" style="width: 100%"></select>`);
                // register on change listener
                parent.firstElementChild.addEventListener('change', function () {
                    row.value = this.value;
                    that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
                });
                FormSelect.resolveData(desc.optionsData)([]).then((values) => {
                    parent.firstElementChild.innerHTML = (!defaultSelection ? `<option value="">${I18nextManager.getInstance().i18n.t('tdp:core.FormMap.selectMe')}</option>` : '') + values.map(mapOptions).join('');
                    if (initialValue) {
                        parent.firstElementChild.selectedIndex = values.map((d) => typeof d === 'string' ? d : d.value).indexOf(initialValue);
                    }
                    else if (defaultSelection) {
                        const first = values[0];
                        row.value = typeof first === 'string' || !first ? first : first.value;
                    }
                    that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
                });
                break;
            case FormElementType.SELECT2:
                parent.insertAdjacentHTML('afterbegin', `<select class="form-control" style="width: 100%"></select>`);
                FormSelect.resolveData(desc.optionsData)([]).then((values) => {
                    const initially = initialValue ? ((Array.isArray(initialValue) ? initialValue : [initialValue]).map((d) => typeof d === 'string' ? d : d.id)) : [];
                    // in case of ajax but have default value
                    if (desc.ajax && values.length === 0 && initialValue) {
                        values = Array.isArray(initialValue) ? initialValue : [initialValue];
                    }
                    parent.firstElementChild.innerHTML = values.map(mapOptions).join('');
                    const s = parent.firstElementChild;
                    const $s = $(s);
                    // merge only the default options if we have no local data
                    $s.select2(BaseUtils.mixin({}, desc.ajax ? FormSelect2.DEFAULT_AJAX_OPTIONS : FormSelect2.DEFAULT_OPTIONS, desc));
                    if (initialValue) {
                        $s.val(initially).trigger('change');
                    }
                    else if (!defaultSelection && that.elementDesc.options.uniqueKeys) {
                        // force no selection
                        $s.val([]).trigger('change');
                    }
                    if (values.length > 0 && !initialValue && defaultSelection) {
                        const first = values[0];
                        row.value = typeof first === 'string' || !first ? first : first.value;
                    }
                    that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
                    // register on change listener use full select2 items
                    $s.on('change', function () {
                        const data = $s.select2('data');
                        if (data.length === 0) {
                            row.value = null;
                        }
                        else {
                            if (desc.return === 'id') {
                                row.value = data.map((r) => r.id);
                            }
                            else if (desc.return === 'text') {
                                row.value = data.map((r) => r.text);
                            }
                            else {
                                row.value = data.map((r) => ({ 'id': r.id, 'text': r.text }));
                            }
                            if (row.value.length === 1) {
                                row.value = row.value[0];
                            }
                        }
                        that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
                    });
                });
                break;
            case FormElementType.SELECT3:
                const select3 = new Select3(desc);
                parent.appendChild(select3.node);
                if (initialValue) {
                    select3.value = Array.isArray(initialValue) ? initialValue : [initialValue];
                }
                else if (!defaultSelection && that.elementDesc.options.uniqueKeys) {
                    select3.value = [];
                }
                that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
                select3.on(Select3.EVENT_SELECT, (evt, prev, next) => {
                    row.value = next;
                    this.fire(FormMap.EVENT_CHANGE, next);
                });
                break;
            default:
                parent.insertAdjacentHTML('afterbegin', `<input class="form-control" value="${initialValue || ''}">`);
                parent.firstElementChild.addEventListener('change', function () {
                    row.value = this.value;
                    that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
                });
                that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
        }
    }
    buildMap() {
        if (Array.isArray(this.elementDesc.options.entries)) {
            this.buildMapImpl(this.elementDesc.options.entries);
        }
        else { // function case
            const dependent = (this.elementDesc.dependsOn || []).map((id) => this.form.getElementById(id));
            const entries = this.elementDesc.options.entries(...dependent);
            this.buildMapImpl(entries);
        }
    }
    buildMapImpl(entries) {
        const that = this;
        const group = this.$group.node();
        group.innerHTML = ''; // remove all approach
        // filter to only valid entries
        const values = this.rows.filter((d) => !!d.key && entries.find((e) => e.value === d.key));
        // put empty row at the end
        values.push({ key: '', value: null });
        this.rows = [];
        const updateOptions = () => {
            // disable used options
            if (!this.elementDesc.options.uniqueKeys) {
                return;
            }
            const keys = new Set(this.rows.map((d) => d.key));
            Array.from(group.querySelectorAll('select.map-selector')).forEach((select) => {
                const selected = select.selectedIndex;
                Array.from(select.options).forEach((option, i) => {
                    option.disabled = i !== selected && option.value !== '' && keys.has(option.value);
                });
            });
        };
        const renderRow = (d) => {
            this.rows.push(d);
            const row = group.ownerDocument.createElement('div');
            row.classList.add('form-group');
            group.appendChild(row);
            row.innerHTML = `
        <div class="col-sm-5">
          <select class="form-control map-selector">
            <option value="">${I18nextManager.getInstance().i18n.t('tdp:core.FormMap.select')}</option>
            ${entries.map((o) => `<option value="${o.value}" ${o.value === d.key ? 'selected="selected"' : ''}>${o.name}</option>`).join('')}
          </select>
        </div>
        <div class="col-sm-6"></div>
        <div class="col-sm-1"><button class="btn btn-default btn-sm" title="${I18nextManager.getInstance().i18n.t('tdp:core.FormMap.remove')}"><span aria-hidden="true">×</span></button></div>`;
            const valueElem = row.querySelector('.col-sm-6');
            if (d.key) { // has value
                this.addValueEditor(d, valueElem, entries);
            }
            else {
                // add remove all button
            }
            row.querySelector('div.col-sm-1 button').addEventListener('click', (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                if (d.key) {
                    // remove this row
                    row.remove();
                    that.rows.splice(that.rows.indexOf(d), 1);
                    updateOptions();
                }
                else {
                    // remove all rows and add the dummy one = me again
                    that.rows = [d];
                    const children = Array.from(group.children);
                    // remove all dom rows
                    children.splice(0, children.length - 1).forEach((d) => d.remove());
                    updateOptions();
                }
                that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
            });
            row.querySelector('select').addEventListener('change', function () {
                if (!this.value) {
                    // remove this row
                    row.remove();
                    that.rows.splice(that.rows.indexOf(d), 1);
                    updateOptions();
                    that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
                    return;
                }
                if (d.key !== this.value) { // value changed
                    if (d.key) { //has an old value?
                        valueElem.innerHTML = '';
                    }
                    else {
                        // ensure that there is an empty row
                        renderRow({ key: '', value: null });
                    }
                    d.key = this.value;
                    that.addValueEditor(d, valueElem, entries);
                    updateOptions();
                }
            });
        };
        values.forEach(renderRow);
        updateOptions();
    }
    /**
     * Returns the value
     * @returns {string}
     */
    get value() {
        // just rows with a valid key and value
        const validRows = this.rows.filter((d) => d.key && d.value !== null);
        // create copies from each row, such that the previous values don't reference to this.value
        return validRows.map((row) => Object.assign({}, row));
    }
    hasValue() {
        return this.value.length > 0;
    }
    /**
     * Sets the value
     * @param v
     */
    set value(v) {
        if (this.isEqual(v, this.value)) {
            return;
        }
        this.rows = v;
        this.previousValue = this.value; // force update
        this.buildMap();
        this.updateBadge();
        this.updateStoredValue();
    }
    focus() {
        // open dropdown
        $(this.$node.select('.dropdown-menu').node()).show();
    }
    isEqual(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        return a.every((ai, i) => {
            const bi = b[i];
            return ai.key === bi.key && ai.value === bi.value;
        });
    }
    static convertRow2MultiMap(rows) {
        if (!rows) {
            return {};
        }
        const map = new Map();
        rows.forEach((row) => {
            if (!map.has(row.key)) {
                map.set(row.key, []);
            }
            const v = map.get(row.key);
            if (Array.isArray(row.value)) {
                v.push(...row.value);
            }
            else {
                v.push(row.value);
            }
        });
        const r = {};
        map.forEach((v, k) => {
            if (v.length === 1) {
                r[k] = v[0];
            }
            else {
                r[k] = v;
            }
        });
        return r;
    }
}
//# sourceMappingURL=FormMap.js.map