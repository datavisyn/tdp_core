import { BaseUtils } from '../base';
import { AFormElement } from './elements/AFormElement';
import { Form } from './elements/Form';
/**
 * Builds a form from a given collection of form elements
 */
export class FormBuilder {
    /**
     * Constructor
     * @param $parent Node that the form should be attached to
     * @param formId unique form id
     * @param formInline whether the form is in inline mode or not
     */
    constructor($parent, formId = BaseUtils.randomId(), formInline = false) {
        this.formId = formId;
        this.formInline = formInline;
        /**
         * Map of all future elements
         */
        this.elementPromises = [];
        this.form = new Form($parent, formId);
    }
    /**
     * Creates a form element instance from a form element description and
     * appends it to the form
     * @param elementDesc
     */
    appendElement(elementDesc) {
        if (!elementDesc.options) {
            elementDesc.options = {};
        }
        elementDesc.options.inlineForm = this.formInline;
        const desc = Form.updateElementDesc(elementDesc, this.formId);
        const elementPromise = AFormElement.createFormElement(this.form, desc);
        this.elementPromises.push(elementPromise);
    }
    /**
     * Append multiple elements at once to the form
     * @param elements list of element descriptions
     */
    appendElements(elements) {
        elements.forEach((el) => {
            this.appendElement(el);
        });
    }
    /**
     * Builds a form from a list of given form element descriptions
     * Once everything is initialized the form is returned
     *
     * @returns {IForm} Loaded and initialized form
     */
    build() {
        // initialize when all elements are loaded
        return Promise.all(this.elementPromises).then((elements) => {
            this.form.appendElements(elements);
            this.form.initAllElements();
            return this.form;
        });
    }
}
//# sourceMappingURL=FormBuilder.js.map