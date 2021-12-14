import * as d3 from 'd3';
import { AFormElement } from './AFormElement';
import { UserSession } from '../../app';
import { ResolveNow } from '../../base';
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
        this.$rootNode = $formNode.append('div').classed(this.elementDesc.options.inlineForm ? 'col-sm-auto' : 'col-sm-12 mt-1 mb-1', true);
        const rowNode = this.$rootNode.append('div').classed('row', true);
        this.setVisible(this.elementDesc.visible);
        this.appendLabel(rowNode);
        const $colDiv = rowNode.append('div').classed('col', true);
        this.$inputNode = $colDiv.append('select');
        this.elementDesc.attributes.clazz = this.elementDesc.attributes.clazz.replace('form-control', 'form-select'); // filter out the form-control class, because the border it creates doesn't contain the whole element due to absolute positioning and it isn't necessary
        this.$inputNode.attr('data-testid', 'form-select');
        $colDiv.attr('data-testid', this.elementDesc.id);
        this.setAttributes(this.$inputNode, this.elementDesc.attributes);
    }
    /**
     * Bind the change listener and propagate the selection by firing a change event
     */
    init() {
        super.init();
        const options = this.elementDesc.options;
        // propagate change action with the data of the selected option
        this.$inputNode.on('change.propagate', () => {
            this.fire(FormSelect.EVENT_CHANGE, this.value, this.$inputNode);
        });
        const data = FormSelect.resolveData(options.optionsData);
        const values = this.handleDependent((values) => {
            data(values).then((items) => {
                this.updateOptionElements(items);
                this.$inputNode.property('selectedIndex', options.selectedIndex || 0);
                this.fire(FormSelect.EVENT_CHANGE, this.value, this.$inputNode);
            });
        });
        const defaultSelectedIndex = this.getStoredValue(0);
        data(values).then((items) => {
            this.updateOptionElements(items);
            const index = options.selectedIndex !== undefined ? options.selectedIndex : Math.min(items.length - 1, defaultSelectedIndex);
            this.previousValue = items[index];
            this.$inputNode.property('selectedIndex', index);
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
        const currentSelectedIndex = this.$inputNode.property('selectedIndex');
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
        this.$inputNode.selectAll('option, optgroup').remove();
        if (!anyGroups) {
            const $options = this.$inputNode.selectAll('option').data(options);
            $options.enter().append('option');
            $options.attr('value', (d) => d.value).html((d) => d.name);
            $options.exit().remove();
            return;
        }
        const node = this.$inputNode.node();
        const $options = this.$inputNode.selectAll(() => Array.from(node.children)).data(options);
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
        const option = d3.select(this.$inputNode.node().selectedOptions[0]);
        return (option.size() > 0) ? option.datum() : null;
    }
    /**
     * Select the option by value. If no value found, then the first option is selected.
     * @param v If string then compares to the option value property. Otherwise compares the object reference.
     */
    set value(v) {
        // if value is undefined or null, set to first index
        if (!v) {
            this.$inputNode.property('selectedIndex', 0);
            this.previousValue = null;
            return;
        }
        this.$inputNode.selectAll('option').data().forEach((d, i) => {
            if ((v.value && d.value === v.value) || d.value === v || d === v) {
                this.$inputNode.property('selectedIndex', i);
                this.updateStoredValue();
                this.previousValue = d; // force value update
            }
        });
    }
    hasValue() {
        return this.value !== null;
    }
    focus() {
        this.$inputNode.node().focus();
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