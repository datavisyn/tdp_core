import * as d3v3 from 'd3v3';
import { IFormElementDesc, IForm, FormElementType } from '../interfaces';
import { AFormElement } from './AFormElement';
import { IPluginDesc } from '../../base';
export interface ICheckBoxElementDesc extends IFormElementDesc {
    type: FormElementType.CHECKBOX;
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
    } & IFormElementDesc['options'];
}
export declare class FormCheckBox extends AFormElement<ICheckBoxElementDesc> {
    readonly pluginDesc: IPluginDesc;
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form: IForm, elementDesc: ICheckBoxElementDesc, pluginDesc: IPluginDesc);
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
    get value(): any;
    /**
     * Sets the value
     * @param v
     */
    set value(v: any);
    focus(): void;
}
//# sourceMappingURL=FormCheckBox.d.ts.map