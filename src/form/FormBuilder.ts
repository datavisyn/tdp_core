/**
 * Created by Samuel Gratzl on 08.03.2017.
 */

import * as d3 from 'd3';
import {BaseUtils} from 'phovea_core';
import {IFormElement, IFormElementDesc, IForm} from './interfaces';
import {AFormElement} from './elements/AFormElement';
import {Form} from './elements/Form';

/**
 * Builds a form from a given collection of form elements
 */
export class FormBuilder {

  /**
   * The form that will be build
   */
  private readonly form: IForm;

  /**
   * Map of all future elements
   */
  private readonly elementPromises: Promise<IFormElement>[] = [];

  /**
   * Constructor
   * @param $parent Node that the form should be attached to
   * @param formId unique form id
   * @param formClass class attribute for form, e.g. for inline forms
   */
  constructor($parent: d3.Selection<any>, private readonly formId = BaseUtils.randomId(), private readonly formClass = null, private readonly formInline: boolean = false) {
    this.form = new Form($parent, formId, formClass, formInline);
  }

  /**
   * Creates a form element instance from a form element description and
   * appends it to the form
   * @param elementDesc
   */
  appendElement(elementDesc: IFormElementDesc) {
    elementDesc.options['inlineForm'] = this.formInline;
    const desc = Form.updateElementDesc(elementDesc, this.formId);

    const elementPromise = AFormElement.createFormElement(this.form, desc);
    this.elementPromises.push(elementPromise);
  }

  /**
   * Append multiple elements at once to the form
   * @param elements list of element descriptions
   */
  appendElements(elements: IFormElementDesc[]) {
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
  build(): Promise<IForm> {
    // initialize when all elements are loaded
    return Promise.all(this.elementPromises)
      .then((elements: IFormElement[]) => {
        this.form.appendElements(elements);
        this.form.initAllElements();
        return this.form;
      });
  }
}
