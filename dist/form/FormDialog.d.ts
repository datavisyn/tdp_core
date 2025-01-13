import { PHOVEA_UI_FormDialog } from '../components';
import { FormBuilder } from './FormBuilder';
import { IForm, IFormElementDesc } from './interfaces';
/**
 * a utililty dialog to show a dialog modal using a FormBuilder
 * @see FormBuilder
 */
export declare class FormDialog extends PHOVEA_UI_FormDialog {
    readonly builder: FormBuilder;
    /**
     * Contains the `IForm` instance from the FormBuilder build process.
     * The value is set in `showAsPromise()`. Otherwise this property is `null`.
     */
    formInstance: IForm | null;
    /**
     * @param {string} title popup title
     * @param {string} primaryButton name of the primary button
     * @param {string} formId form id to use to avoid conflicts
     */
    constructor(title: string, primaryButton: string, formId?: string);
    /**
     * adds additional form builder elememts
     * @param {IFormElementDesc} elements
     */
    append(...elements: IFormElementDesc[]): void;
    /**
     * register a callback when the form is submitted
     * @param form the form of this dialog
     * @param callback called when submitted
     * @returns {JQuery}
     */
    private onFormSubmit;
    /**
     * utility to show this dialog and resolve as soon it has been been submitted
     * @param processData converter from a form builder to the output format
     * @returns {Promise<T>}
     */
    showAsPromise<T>(processData: (form: IForm) => T): Promise<T>;
}
//# sourceMappingURL=FormDialog.d.ts.map