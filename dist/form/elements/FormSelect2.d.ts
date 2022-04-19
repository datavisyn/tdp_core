import 'select2';
import * as d3 from 'd3';
import { AFormElement } from './AFormElement';
import { IForm, IFormElementDesc, FormElementType } from '../interfaces';
import { IPluginDesc } from '../../base';
declare type IFormSelect2Options = Select2Options & {
    return?: 'text' | 'id';
    data?: ISelect2Option[] | ((dependents: any) => ISelect2Option[]);
    /**
     * Define one or multiple values that are selected when initializing the Select2
     * Values as array only works when Select2 is `multiple` mode.
     * @default null
     */
    selectedDefaultValue?: string | string[] | null;
};
/**
 * Add specific options for select form elements
 */
export interface IFormSelect2 extends IFormElementDesc {
    type: FormElementType.SELECT2;
    /**
     * Additional options
     */
    options?: IFormSelect2Options & IFormElementDesc['options'];
}
export interface ISelect2Option {
    id: string;
    text: string;
    data?: any;
}
/**
 * Select2 drop down field with integrated search field and communication to external data provider
 * Propagates the changes from the DOM select element using the internal `change` event
 */
export declare class FormSelect2 extends AFormElement<IFormSelect2> {
    readonly pluginDesc: IPluginDesc;
    static readonly DEFAULT_OPTIONS: {
        placeholder: string;
        theme: string;
        minimumInputLength: number;
        escapeMarkup: (markup: any) => any;
        templateResult: (item: any) => any;
        templateSelection: (item: any) => any;
    };
    static readonly DEFAULT_AJAX_OPTIONS: {
        placeholder: string;
        theme: string;
        minimumInputLength: number;
        escapeMarkup: (markup: any) => any;
        templateResult: (item: any) => any;
        templateSelection: (item: any) => any;
        ajax: {
            url: string;
            dataType: string;
            delay: number;
            cache: boolean;
            data: (params: any) => {
                query: any;
                page: any;
            };
            processResults: (data: any, params: any) => {
                results: any;
                pagination: {
                    more: any;
                };
            };
        };
    };
    private $select;
    private $jqSelect;
    private readonly isMultiple;
    private readonly listener;
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form: IForm, elementDesc: IFormSelect2, pluginDesc: IPluginDesc);
    /**
     * Build the label and select element
     * @param $formNode The parent node this element will be attached to
     */
    build($formNode: d3.Selection<any>): void;
    /**
     * Bind the change listener and propagate the selection by firing a change event
     */
    init(): void;
    /**
     * Builds the jQuery select2
     */
    private buildSelect2;
    private resolveValue;
    hasValue(): boolean;
    /**
     * Select the option by value. If no value found, then the first option is selected.
     * @param v If string then compares to the option value property. Otherwise compares the object reference.
     */
    set value(v: (ISelect2Option | string) | (ISelect2Option | string)[]);
    /**
     * Returns the selected value or if nothing found `null`
     * @returns {string|{name: string, value: string, data: any}|null}
     */
    get value(): (ISelect2Option | string) | (ISelect2Option | string)[];
    focus(): void;
    /**
     * compare array independent of the order
     * @param a
     * @param b
     * @returns {boolean}
     */
    static sameIds(a: string[], b: string[]): boolean;
}
export {};
//# sourceMappingURL=FormSelect2.d.ts.map