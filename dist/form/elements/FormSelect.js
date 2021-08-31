/**
 * Created by Samuel Gratzl on 08.03.2017.
 */
import * as d3 from 'd3';
import { UserSession, ResolveNow } from 'phovea_core';
import { AFormElement } from './AFormElement';
/**
 * Select form element instance
 * Propagates the changes from the DOM select element using the internal `change` event
 */
export class FormSelect extends AFormElement {
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form, elementDesc, pluginDesc) {
        super(form, elementDesc, pluginDesc);
        this.pluginDesc = pluginDesc;
    }
    updateStoredValue() {
        if (!this.elementDesc.useSession) {
            return;
        }
        UserSession.getInstance().store(`${this.id}_selectedIndex`, this.getSelectedIndex());
    }
    getStoredValue(defaultValue) {
        if (!this.elementDesc.useSession) {
            return defaultValue;
        }
        return UserSession.getInstance().retrieve(`${this.id}_selectedIndex`, defaultValue);
    }
    /**
     * Build the label and select element
     * @param $formNode The parent node this element will be attached to
     */
    build($formNode) {
        this.addChangeListener();
        const $parentNode = $formNode.append('div').classed(this.elementDesc.options.inlineForm ? 'col-sm-auto' : 'col-sm-12 mt-1 mb-1', true);
        this.$node = $parentNode.append('div').classed('row', true);
        this.setVisible(this.elementDesc.visible);
        this.appendLabel();
        const $colDiv = this.$node.append('div').classed('col', true);
        this.$select = $colDiv.append('select');
        this.elementDesc.attributes.clazz = this.elementDesc.attributes.clazz.replace('form-control', 'form-select'); // filter out the form-control class, because the border it creates doesn't contain the whole element due to absolute positioning and it isn't necessary
        this.setAttributes(this.$select, this.elementDesc.attributes);
    }
    setVisible(visible) {
        super.setVisible(visible);
        // Because this.$node is the first child of the appended div, we also need to set the parent to hidden.
        // Otherwise, the markup will look like this: <div class="col-sm-auto"><div class="row" hidden></div></div>, i.e. without the parent being hidden.
        // This causes the next element to be padded because the .col-sm-auto div is not hidden, only its child.
        // TODO: This should be applied to all Form[...] elements where the this.$node != root element.
        d3.select(this.$node.node().parentElement).attr('hidden', visible ? null : '');
    }
    /**
     * Bind the change listener and propagate the selection by firing a change event
     */
    init() {
        super.init();
        const options = this.elementDesc.options;
        // propagate change action with the data of the selected option
        this.$select.on('change.propagate', () => {
            this.fire(FormSelect.EVENT_CHANGE, this.value, this.$select);
        });
        const data = FormSelect.resolveData(options.optionsData);
        const values = this.handleDependent((values) => {
            data(values).then((items) => {
                this.updateOptionElements(items);
                this.$select.property('selectedIndex', options.selectedIndex || 0);
                this.fire(FormSelect.EVENT_CHANGE, this.value, this.$select);
            });
        });
        const defaultSelectedIndex = this.getStoredValue(0);
        data(values).then((items) => {
            this.updateOptionElements(items);
            const index = options.selectedIndex !== undefined ? options.selectedIndex : Math.min(items.length - 1, defaultSelectedIndex);
            this.previousValue = items[index];
            this.$select.property('selectedIndex', index);
            if (options.selectedIndex === undefined && index > 0) {
                this.fire(FormSelect.EVENT_INITIAL_VALUE, this.value, items[0]);
            }
        });
    }
    /**
     * Returns the selectedIndex. If the option `useSession` is enabled,
     * the index from the session will be used as fallback
     */
    getSelectedIndex() {
        const defaultSelectedIndex = this.getStoredValue(0);
        const currentSelectedIndex = this.$select.property('selectedIndex');
        return (currentSelectedIndex === -1) ? defaultSelectedIndex : currentSelectedIndex;
    }
    /**
     * Update the options of a select form element using the given data array
     * @param data
     */
    updateOptionElements(data) {
        const options = data.map(FormSelect.toOption);
        const isGroup = (d) => {
            return Array.isArray(d.children);
        };
        const anyGroups = data.some(isGroup);
        this.$select.selectAll('option, optgroup').remove();
        if (!anyGroups) {
            const $options = this.$select.selectAll('option').data(options);
            $options.enter().append('option');
            $options.attr('value', (d) => d.value).html((d) => d.name);
            $options.exit().remove();
            return;
        }
        const node = this.$select.node();
        const $options = this.$select.selectAll(() => Array.from(node.children)).data(options);
        $options.enter()
            .append((d) => node.ownerDocument.createElement(isGroup ? 'optgroup' : 'option'));
        const $sub = $options.filter(isGroup)
            .attr('label', (d) => d.name)
            .selectAll('option').data((d) => d.children);
        $sub.enter().append('option');
        $sub.attr('value', (d) => d.value).html((d) => d.name);
        $sub.exit().remove();
        $options.filter((d) => !isGroup)
            .attr('value', (d) => (d.value))
            .html((d) => d.name);
        $options.exit().remove();
    }
    /**
     * Returns the selected value or if nothing found `null`
     * @returns {string|{name: string, value: string, data: any}|null}
     */
    get value() {
        const option = d3.select(this.$select.node().selectedOptions[0]);
        return (option.size() > 0) ? option.datum() : null;
    }
    /**
     * Select the option by value. If no value found, then the first option is selected.
     * @param v If string then compares to the option value property. Otherwise compares the object reference.
     */
    set value(v) {
        // if value is undefined or null, set to first index
        if (!v) {
            this.$select.property('selectedIndex', 0);
            this.previousValue = null;
            return;
        }
        this.$select.selectAll('option').data().forEach((d, i) => {
            if ((v.value && d.value === v.value) || d.value === v || d === v) {
                this.$select.property('selectedIndex', i);
                this.updateStoredValue();
                this.previousValue = d; // force value update
            }
        });
    }
    hasValue() {
        return this.value !== null;
    }
    focus() {
        this.$select.node().focus();
    }
    static toOption(d) {
        if (typeof d === 'string') {
            return { name: d, value: d, data: d };
        }
        return d;
    }
    static resolveData(data) {
        if (data === undefined) {
            return () => ResolveNow.resolveImmediately([]);
        }
        if (Array.isArray(data)) {
            return () => ResolveNow.resolveImmediately(data.map(this.toOption));
        }
        if (data instanceof Promise) {
            return () => data.then((r) => r.map(this.toOption));
        }
        //assume it is a function
        return (dependents) => {
            const r = data(dependents);
            if (r instanceof Promise) {
                return r.then((r) => r.map(this.toOption));
            }
            if (Array.isArray(r)) {
                return ResolveNow.resolveImmediately(r.map(this.toOption));
            }
            return ResolveNow.resolveImmediately(r);
        };
    }
}
//# sourceMappingURL=FormSelect.js.map