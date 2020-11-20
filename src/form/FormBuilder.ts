/**
 * Created by Samuel Gratzl on 08.03.2017.
 */

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
   * @param parentElement DOM element that the form should be attached to
   * @param formId unique form id
   */
  constructor(parentElement: HTMLElement, private readonly formId = BaseUtils.randomId()) {
    this.form = new Form(parentElement, formId);
  }

  /**
   * Creates a form element instance from a form element description and
   * appends it to the form
   * @param elementDesc
   */
  appendElement(elementDesc: IFormElementDesc) {
    const desc = Form.updateElementDesc(elementDesc, this.formId);

    const elementPromise = AFormElement.createFormElement(this.form, this.form.node, desc);
    this.elementPromises.push(elementPromise);

    // append element to form once it is loaded
    elementPromise.then((element: IFormElement) => {
      this.form.appendElement(element);
    });
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
      .then(() => {
        this.form.initializeAllElements();
        return this.form;
      });
  }
}
