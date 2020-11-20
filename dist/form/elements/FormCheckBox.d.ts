import { IFormElementDesc, IForm } from '../interfaces';
import { AFormElement } from './AFormElement';
import { IPluginDesc } from 'phovea_core';
export interface ICheckBoxElementDesc extends IFormElementDesc {
    options: {
        /**
         * checked value
         */
        checked?: any;
        /**
         * unchecked value
         */
        unchecked?: any;
        /**
         * default value
         */
        isChecked?: any;
    };
}
export declare class FormCheckBox extends AFormElement<ICheckBoxElementDesc> {
    readonly pluginDesc: IPluginDesc;
    private inputElement;
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param parentElement The parent node this element will be attached to
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form: IForm, parentElement: HTMLElement, elementDesc: ICheckBoxElementDesc, pluginDesc: IPluginDesc);
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
