import * as d3v3 from 'd3v3';
import { IPluginDesc } from 'visyn_core/plugin';
import { AFormElement } from './AFormElement';
import { FormElementType, IForm, IFormElement, IFormElementDesc } from '../interfaces';
export interface IFormSelectOption {
    name: string;
    value: string;
    data: any;
}
export interface IFormSelectOptionGroup {
    name: string;
    children: IFormSelectOption[];
}
export declare type ISelectOptions = (string | IFormSelectOption)[] | Promise<(string | IFormSelectOption)[]>;
export declare type IHierarchicalSelectOptions = (string | IFormSelectOption | IFormSelectOptionGroup)[] | Promise<(string | IFormSelectOption | IFormSelectOptionGroup)[]>;
export interface IFormSelectOptions {
    /**
     * Data for the options elements of the select
     */
    optionsData?: IHierarchicalSelectOptions | ((dependents: any[]) => IHierarchicalSelectOptions);
    /**
     * Index of the selected option; this option overrides the selected index from the `useSession` property
     */
    selectedIndex?: number;
}
/**
 * Add specific options for select form elements
 */
export interface IFormSelectDesc extends IFormElementDesc {
    type: FormElementType.SELECT;
    /**
     * Additional options
     */
    options?: IFormSelectOptions & IFormElementDesc['options'];
}
export interface IFormSelectElement extends IFormElement {
    getSelectedIndex(): number;
    updateOptionElements(data: (string | IFormSelectOption | IFormSelectOptionGroup)[]): void;
}
/**
 * Select form element instance
 * Propagates the changes from the DOM select element using the internal `change` event
 */
export declare class FormSelect extends AFormElement<IFormSelectDesc> implements IFormSelectElement {
    readonly pluginDesc: IPluginDesc;
    private $select;
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form: IForm, elementDesc: IFormSelectDesc, pluginDesc: IPluginDesc);
    protected updateStoredValue(): void;
    protected getStoredValue<T>(defaultValue: T): T;
    /**
     * Build the label and select element
     * @param $formNode The parent node this element will be attached to
     */
    build($formNode: d3v3.Selection<any>): void;
    /**
     * Bind the change listener and propagate the selection by firing a change event
     */
    init(): void;
    /**
     * Returns the selectedIndex. If the option `useSession` is enabled,
     * the index from the session will be used as fallback
     */
    getSelectedIndex(): number;
    /**
     * Update the options of a select form element using the given data array
     * @param data
     */
    updateOptionElements(data: (string | IFormSelectOption | IFormSelectOptionGroup)[]): void;
    /**
     * Returns the selected value or if nothing found `null`
     * @returns {string|{name: string, value: string, data: any}|null}
     */
    get value(): any;
    /**
     * Select the option by value. If no value found, then the first option is selected.
     * @param v If string then compares to the option value property. Otherwise compares the object reference.
     */
    set value(v: any);
    hasValue(): boolean;
    focus(): void;
    static toOption(d: string | IFormSelectOption | IFormSelectOptionGroup): IFormSelectOption | IFormSelectOptionGroup;
    static resolveData(data?: IHierarchicalSelectOptions | ((dependents: any[]) => IHierarchicalSelectOptions)): (dependents: any[]) => PromiseLike<(IFormSelectOption | IFormSelectOptionGroup)[]>;
}
//# sourceMappingURL=FormSelect.d.ts.map