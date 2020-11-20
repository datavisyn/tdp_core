import { IFormElementDesc, IForm } from '../interfaces';
import { AFormElement } from './AFormElement';
import { IFormSelectOption } from './FormSelect';
import { IPluginDesc } from 'phovea_core';
export interface IRadioElementDesc extends IFormElementDesc {
    options: {
        buttons: IFormSelectOption[];
    };
}
export declare class FormRadio extends AFormElement<IRadioElementDesc> {
    readonly pluginDesc: IPluginDesc;
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param parentElement The parent node this element will be attached to
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form: IForm, parentElement: HTMLElement, elementDesc: IRadioElementDesc, pluginDesc: IPluginDesc);
    /**
     * Build the label and input element
     */
    protected build(): void;
    /**
     * Bind the change listener and propagate the selection by firing a change event
     */
    init(): void;
    /**
     * Returns the value
     * @returns {string}
     */
    get value(): any;
    /**
     * Sets the value
     * @param v
     */
    set value(v: any);
    focus(): void;
}
