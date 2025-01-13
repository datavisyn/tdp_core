import * as d3v3 from 'd3v3';
import { IPluginDesc } from 'visyn_core/plugin';
import { AFormElement } from './AFormElement';
import { FormElementType, IForm, IFormElementDesc } from '../interfaces';
import { ISelect2Option } from './FormSelect2';
import { ISelect3Item, ISelect3Options, IdTextPair } from './Select3';
declare type IFormSelect3Options = Partial<ISelect3Options<ISelect2Option>> & {
    return?: 'text' | 'id';
    data?: ISelect2Option[] | ((dependents: any) => ISelect2Option[]);
};
/**
 * Add specific options for select form elements
 */
export interface IFormSelect3 extends IFormElementDesc {
    type: FormElementType.SELECT3;
    /**
     * Additional options
     */
    options?: IFormSelect3Options & IFormElementDesc['options'];
}
/**
 * Select2 drop down field with integrated search field and communication to external data provider
 * Propagates the changes from the DOM select element using the internal `change` event
 */
export declare class FormSelect3 extends AFormElement<IFormSelect3> {
    readonly pluginDesc: IPluginDesc;
    private readonly isMultiple;
    private select3;
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form: IForm, elementDesc: IFormSelect3, pluginDesc: IPluginDesc);
    /**
     * Build the label and select element
     * @param $formNode The parent node this element will be attached to
     */
    build($formNode: d3v3.Selection<any>): void;
    /**
     * Bind the change listener and propagate the selection by firing a change event
     */
    init(): void;
    hasValue(): boolean;
    /**
     * Returns the selected value or if nothing found `null`
     * @returns {ISelect3Item<IdTextPair> | string | (ISelect3Item<IdTextPair> | string)[]}
     */
    get value(): (ISelect3Item<IdTextPair> | string) | (ISelect3Item<IdTextPair> | string)[];
    /**
     * Select the option by value. If no value found, then the first option is selected.
     * @param v If string then compares to the option value property. Otherwise compares the object reference.
     */
    set value(v: (ISelect3Item<IdTextPair> | string) | (ISelect3Item<IdTextPair> | string)[]);
    focus(): void;
}
export {};
//# sourceMappingURL=FormSelect3.d.ts.map