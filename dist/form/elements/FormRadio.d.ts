import { IFormElementDesc, IForm } from '../interfaces';
import * as d3 from 'd3';
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
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form: IForm, elementDesc: IRadioElementDesc, pluginDesc: IPluginDesc);
    /**
     * Build the label and input element
     * @param $formNode The parent node this element will be attached to
     */
    build($formNode: d3.Selection<any>): void;
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
