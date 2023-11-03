import * as d3v3 from 'd3v3';
import { IPluginDesc } from 'visyn_core/plugin';
import { AFormElement } from './AFormElement';
import { IFormElementDesc, IForm, FormElementType } from '../interfaces';
/**
 * Add specific options for input form elements
 */
export interface IFormInputTextDesc extends IFormElementDesc {
    type: FormElementType.INPUT_TEXT;
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
    } & IFormElementDesc['options'];
}
export declare class FormInputText extends AFormElement<IFormInputTextDesc> {
    readonly pluginDesc: IPluginDesc;
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form: IForm, elementDesc: IFormInputTextDesc, pluginDesc: IPluginDesc);
    /**
     * Build the label and input element
     * @param $formNode The parent node this element will be attached to
     */
    build($formNode: d3v3.Selection<any>): void;
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
//# sourceMappingURL=FormInputText.d.ts.map