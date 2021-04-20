/**
 * Created by Samuel Gratzl on 07.06.2017.
 */
import { FormDialog as Dialog } from 'phovea_ui';
import { BaseUtils } from 'phovea_core';
import { FormBuilder } from './FormBuilder';
import { select } from 'd3';
/**
 * a utililty dialog to show a dialog modal using a FormBuilder
 * @see FormBuilder
 */
export class FormDialog extends Dialog {
    /**
     * @param {string} title popup title
     * @param {string} primaryButton name of the primary button
     * @param {string} formId form id to use to avoid conflicts
     */
    constructor(title, primaryButton, formId = 'form' + BaseUtils.randomId(5)) {
        super(title, primaryButton, formId);
        this.body.innerHTML = ''; //clear old form since the form builder brings its own
        this.builder = new FormBuilder(select(this.body), formId);
        this.onHide(() => {
            this.destroy();
        });
    }
    /**
     * adds additional form builder elememts
     * @param {IFormElementDesc} elements
     */
    append(...elements) {
        this.builder.appendElements(elements);
    }
    /**
     * register a callback when the form is submitted
     * @param form the form of this dialog
     * @param callback called when submitted
     * @returns {JQuery}
     */
    onFormSubmit(form, callback) {
        return super.onSubmit(() => {
            if (!form.validate()) {
                return false;
            }
            callback(form);
            return false;
        });
    }
    /**
     * utility to show this dialog and resolve as soon it has been been submitted
     * @param processData converter from a form builder to the output format
     * @returns {Promise<T>}
     */
    async showAsPromise(processData) {
        this.formInstance = await this.builder.build();
        return new Promise((resolve) => {
            this.onFormSubmit(this.formInstance, (form) => {
                const data = processData(form);
                if (data !== null) {
                    this.hide();
                    resolve(data);
                }
            });
            this.show();
            setTimeout(() => {
                const first = this.body.querySelector('input, select, textarea');
                if (first) {
                    first.focus();
                }
            }, 250); // till dialog is visible
        });
    }
}
//# sourceMappingURL=FormDialog.js.map