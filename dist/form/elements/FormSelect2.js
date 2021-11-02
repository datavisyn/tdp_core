/**
 * Created by Samuel Gratzl on 08.03.2017.
 */
import 'select2';
import $ from 'jquery';
import { BaseUtils, AppContext } from 'phovea_core';
import { AFormElement } from './AFormElement';
/**
 * Select2 drop down field with integrated search field and communication to external data provider
 * Propagates the changes from the DOM select element using the internal `change` event
 */
export class FormSelect2 extends AFormElement {
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form, elementDesc, pluginDesc) {
        super(form, elementDesc, pluginDesc);
        this.pluginDesc = pluginDesc;
        this.listener = () => {
            this.fire(FormSelect2.EVENT_CHANGE, this.value, this.$jqSelect);
        };
        this.isMultiple = (pluginDesc.selection === 'multiple');
    }
    /**
     * Build the label and select element
     * @param $formNode The parent node this element will be attached to
     */
    build($formNode) {
        this.addChangeListener();
        this.$rootNode = $formNode.append('div').classed(this.elementDesc.options.inlineForm ? 'col-sm-auto' : 'col-sm-12 mt-1 mb-1', true);
        const rowNode = this.$rootNode.append('div').classed('row', true);
        this.setVisible(this.elementDesc.visible);
        this.appendLabel(rowNode);
        const $colSelectNode = rowNode.append('div').classed('col', true);
        this.$inputNode = $colSelectNode.append('select');
        // generate index of element in parentelement
        const indexInParent = Array.from(this.$rootNode.node().parentNode.children).indexOf(this.$rootNode.node());
        this.$inputNode.attr('data-testid', `${this.elementDesc.id}_select2_${indexInParent}`);
        this.setAttributes(this.$inputNode, this.elementDesc.attributes);
    }
    /**
     * Bind the change listener and propagate the selection by firing a change event
     */
    init() {
        super.init();
        const values = this.handleDependent(() => {
            //not supported
        });
        const df = this.elementDesc.options.data;
        const data = Array.isArray(df) ? df : (typeof df === 'function' ? df(values) : undefined);
        this.buildSelect2(this.$inputNode, this.elementDesc.options || {}, data);
        // propagate change action with the data of the selected option
        this.$jqSelect.on('change.propagate', this.listener);
    }
    /**
     * Builds the jQuery select2
     */
    buildSelect2($select, options, data) {
        const select2Options = {};
        let initialValue = [];
        const defaultVal = this.getStoredValue(null);
        if (defaultVal) {
            if (this.isMultiple) {
                const defaultValues = Array.isArray(defaultVal) ? defaultVal : [defaultVal];
                initialValue = defaultValues.map((d) => typeof d === 'string' ? d : d.id);
                if (!data) { //derive default data if none is set explictly
                    data = defaultValues.map((d) => (typeof d === 'string' ? ({ id: d, text: d }) : d));
                }
            }
            else {
                initialValue = [typeof defaultVal === 'string' ? defaultVal : defaultVal.id];
                if (!data) {
                    data = [typeof defaultVal === 'string' ? ({ id: defaultVal, text: defaultVal }) : defaultVal];
                }
            }
        }
        if (this.isMultiple) {
            select2Options.multiple = true;
            select2Options.allowClear = true;
        }
        BaseUtils.mixin(select2Options, options.ajax ? FormSelect2.DEFAULT_AJAX_OPTIONS : FormSelect2.DEFAULT_OPTIONS, options, { data });
        this.$jqSelect = $($select.node()).select2(select2Options).val(initialValue).trigger('change');
        // force the old value from initial
        this.previousValue = this.resolveValue(this.$jqSelect.select2('data'));
        if (defaultVal) {
            this.fire(FormSelect2.EVENT_INITIAL_VALUE, this.value, null);
        }
        const select2TestId = `${this.$inputNode.attr('data-testid')}-select2`;
        this.$jqSelect[0].nextElementSibling.setAttribute('data-testid', select2TestId);
        return this.$jqSelect;
    }
    resolveValue(items) {
        const returnValue = this.elementDesc.options.return;
        const returnF = returnValue === 'id' ? (d) => d.id : (returnValue === 'text' ? (d) => d.text : (d) => d);
        if (!items || items.length === 0) {
            return this.isMultiple ? [] : returnF({ id: '', text: '' });
        }
        const data = items.map((d) => ({ id: d.id, text: d.text, data: d.data ? d.data : undefined })).map(returnF);
        return this.isMultiple ? data : data[0];
    }
    /**
     * Returns the selected value or if nothing found `null`
     * @returns {string|{name: string, value: string, data: any}|null}
     */
    get value() {
        return this.resolveValue(this.$jqSelect.select2('data'));
    }
    hasValue() {
        const v = this.value;
        if (this.isMultiple) {
            return v.length > 0;
        }
        else {
            return v !== '' || v.id !== '';
        }
    }
    /**
     * Select the option by value. If no value found, then the first option is selected.
     * @param v If string then compares to the option value property. Otherwise compares the object reference.
     */
    set value(v) {
        try {
            this.$jqSelect.off('change.propagate', this.listener);
            // if value is undefined or null, clear
            if (!v) {
                this.$jqSelect.val([]).trigger('change');
                this.previousValue = this.isMultiple ? [] : null;
                return;
            }
            let r = null;
            if (this.isMultiple) {
                const values = Array.isArray(v) ? v : [v];
                r = values.map((d) => d.value || d.id);
                const old = this.value;
                if (FormSelect2.sameIds(old.map((d) => d.id), r)) {
                    return;
                }
            }
            else {
                const vi = Array.isArray(v) ? v[0] : v;
                r = vi;
                if (vi.value || vi.id) {
                    r = vi.value || vi.id;
                }
                const old = this.value;
                if (old.id === r) { // no change
                    return;
                }
            }
            // need to select just the ids
            // TODO doesn't work for AJAX based solutions
            this.$jqSelect.val(r).trigger('change');
            this.previousValue = this.value; // force set
            this.updateStoredValue();
        }
        finally {
            this.$jqSelect.on('change.propagate', this.listener);
        }
    }
    focus() {
        this.$jqSelect.select2('open');
    }
    /**
     * compare array independent of the order
     * @param a
     * @param b
     * @returns {boolean}
     */
    static sameIds(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        const bids = new Set(b);
        // all of a contained in b
        return a.every((d) => bids.has(d));
    }
}
FormSelect2.DEFAULT_OPTIONS = {
    placeholder: 'Start typing...',
    theme: 'bootstrap',
    minimumInputLength: 0,
    //selectOnClose: true,
    //tokenSeparators: [' ', ',', ';'], // requires multiple attribute for select element
    escapeMarkup: (markup) => markup,
    templateResult: function (item) {
        const textCamelCase = item.text.replace(/\s/g, '');
        return `<span data-testid="select2-option-${item.id}-${textCamelCase}">${item.text}</span>`;
    },
    templateSelection: (item) => item.text
};
FormSelect2.DEFAULT_AJAX_OPTIONS = Object.assign({
    ajax: {
        url: AppContext.getInstance().api2absURL('url_needed'),
        dataType: 'json',
        delay: 250,
        cache: true,
        data: (params) => {
            return {
                query: params.term === undefined ? '' : params.term,
                page: params.page === undefined ? 0 : params.page
            };
        },
        processResults: (data, params) => {
            params.page = params.page === undefined ? 0 : params.page;
            return {
                results: data.items,
                pagination: {
                    more: data.more
                }
            };
        }
    }
}, FormSelect2.DEFAULT_OPTIONS);
//# sourceMappingURL=FormSelect2.js.map