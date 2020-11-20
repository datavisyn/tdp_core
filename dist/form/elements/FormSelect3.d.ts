/**
 * Created by Samuel Gratzl on 08.03.2017.
 */
import { AFormElement } from './AFormElement';
import { IForm, IFormElementDesc } from '../interfaces';
import { IdTextPair, ISelect3Item, ISelect3Options } from './Select3';
import { ISelect2Option } from './FormSelect2';
import { IPluginDesc } from 'phovea_core';
declare type IFormSelect3Options = Partial<ISelect3Options<ISelect2Option>> & {
    return?: 'text' | 'id';
    data?: ISelect2Option[] | ((dependents: any) => ISelect2Option[]);
};
/**
 * Add specific options for select form elements
 */
export interface IFormSelect3 extends IFormElementDesc {
    /**
     * Additional options
     */
    options?: IFormSelect3Options;
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
     * @param parentElement The parent node this element will be attached to
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form: IForm, parentElement: HTMLElement, elementDesc: IFormSelect3, pluginDesc: IPluginDesc);
    /**
     * Build the label and select element
     */
    protected build(): void;
    /**
     * Bind the change listener and propagate the selection by firing a change event
     */
    init(): void;
    /**
     * Returns the selected value or if nothing found `null`
     * @returns {ISelect3Item<IdTextPair> | string | (ISelect3Item<IdTextPair> | string)[]}
     */
    get value(): (ISelect3Item<IdTextPair> | string) | (ISelect3Item<IdTextPair> | string)[];
    hasValue(): boolean;
    /**
     * Select the option by value. If no value found, then the first option is selected.
     * @param v If string then compares to the option value property. Otherwise compares the object reference.
     */
    set value(v: (ISelect3Item<IdTextPair> | string) | (ISelect3Item<IdTextPair> | string)[]);
    focus(): void;
}
export {};
