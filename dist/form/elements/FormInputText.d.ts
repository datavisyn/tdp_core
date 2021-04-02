/**
 * Created by Samuel Gratzl on 08.03.2017.
 */
import { AFormElement } from './AFormElement';
import { IFormElementDesc, IForm } from '../interfaces';
import { IPluginDesc } from 'phovea_core';
/**
 * Add specific options for input form elements
 */
export interface IFormInputTextDesc extends IFormElementDesc {
    /**
     * Additional options
     */
    options?: {
        /**
         * input field type: text, number, email, ...
         * @default text
         */
        type?: string;
        /**
         * Step size for input type `number`
         * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number#step
         */
        step?: string;
    };
}
export declare class FormInputText extends AFormElement<IFormInputTextDesc> {
    readonly pluginDesc: IPluginDesc;
    private input;
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param parentElement The parent node this element will be attached to
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form: IForm, parentElement: HTMLElement, elementDesc: IFormInputTextDesc, pluginDesc: IPluginDesc);
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
    get value(): string;
    /**
     * Sets the value
     * @param v
     */
    set value(v: string);
    focus(): void;
}
