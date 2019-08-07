/**
 * Created by Samuel Gratzl on 08.03.2017.
 */

import {randomId} from 'phovea_core/src/index';
import {IFormElement, IForm, IFormElementDesc} from '../interfaces';

/**
 * Creates a copy of the element description and modifies the description:
 * - generate a unique id based on the form id
 * - add css class for bootstrap theme
 *
 * @param desc form element desc
 * @param formId id of the form the element will be append to
 */
export function updateElementDesc(desc: IFormElementDesc, formId: string): IFormElementDesc {
    const elementDesc = Object.assign({}, desc); // create copy

    // inject formId into form element id
    const uid = elementDesc.id + '_' + formId;

    elementDesc.attributes = elementDesc.attributes || {};
    elementDesc.attributes.id = uid; // add id as attribute
    elementDesc.attributes.clazz = elementDesc.attributes.clazz || '';
    elementDesc.attributes.clazz += ' form-control';

    return elementDesc;
}

/**
 * Builds a form from a given collection of form elements
 */
export class Form implements IForm {

  /**
   * DOM node for the form itself
   */
  readonly node: HTMLElement;

  /**
   * Map of all appended form elements with the element id as key
   */
  private readonly elements = new Map<string, IFormElement>();

  /**
   * Constructor
   * @param parentElement Node that the form should be attached to
   * @param formId unique form id
   */
  constructor(parentElement: HTMLElement, private readonly formId = randomId()) {
    this.node = parentElement.ownerDocument.createElement('form');
    this.node.setAttribute('id', this.formId);
    parentElement.appendChild(this.node);
  }

  /**
   * Append a form element and builds it
   * Note: The initialization of the element must be done using `initializeAllElements`
   * @param element Form element
   */
  appendElement(element: IFormElement) {
    this.elements.set(element.id, element);
  }

  /**
   * Initialize all elements of this form
   * At this stage it is possible to reference dependencies to other form fields
   */
  initializeAllElements() {
    this.elements.forEach((element) => element.initialize());
  }

  /**
   * number of form elements
   */
  get length() {
    return this.elements.size;
  }

  /**
   * Returns the form element instance, if exists. Otherwise returns `null`.
   * @param id
   * @returns {IFormElement}
   */
  getElementById(id: string) {
    return this.elements.get(id);
  }

  /**
   * Returns an object with the form element id as key and the current data as value
   * @returns {{}}
   */
  getElementData(): { [key: string]: any } {
    const r: { [key: string]: any } = {};
    this.elements.forEach((el, key) => {
      const value = el.value;
      r[key] = (value !== null && value.data !== undefined) ? value.data : value;
    });
    return r;
  }

  /**
   * Returns an object with the form element id as key and the current form element value
   * @returns {{}}
   */
  getElementValues(): { [key: string]: any } {
    const r: { [key: string]: any } = {};
    this.elements.forEach((el, key) => {
      const value = el.value;
      r[key] = value.value || value;
    });
    return r;
  }

  /**
   * validates the current form
   * @returns {boolean} if valid
   */
  validate() {
    return Array.from(this.elements.values())
      .map((d) => d.validate()) // perform validation on each element (returns array of boolean values)
      .every((d) => d); // return true if every validation was truthy
  }
}
