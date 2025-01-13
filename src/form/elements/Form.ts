import * as d3v3 from 'd3v3';

import { BaseUtils } from '../../base';
import { IForm, IFormElement, IFormElementDesc } from '../interfaces';

/**
 * Builds a form from a given collection of form elements
 */
export class Form implements IForm {
  /**
   * DOM node for the form itself
   */
  private readonly $node: d3v3.Selection<any>;

  /**
   * Map of all appended form elements with the element id as key
   */
  private readonly elements = new Map<string, IFormElement>();

  /**
   * Constructor
   * @param $parent Node that the form should be attached to
   * @param formId unique form id
   */
  constructor(
    $parent: d3v3.Selection<any>,
    private readonly formId = BaseUtils.randomId(),
  ) {
    this.$node = $parent.append('form').attr('class', `row align-items-center`).attr('id', this.formId);
  }

  /**
   * Append a form element and builds it
   * Note: The initialization of the element must be done using `initAllElements()`
   * @param element Form element
   */
  appendElement(element: IFormElement) {
    element.build(this.$node);
    this.elements.set(element.id, element);
  }

  /**
   * Append multiple form element at once and and build them
   * Note: The initialization of the element must be done using `initAllElements()`
   * @param element Form element
   */
  appendElements(elements: IFormElement[]) {
    elements.forEach((element) => this.appendElement(element));
  }

  /**
   * Initialize all elements of this form
   * At this stage it is possible to reference dependencies to other form fields
   */
  initAllElements() {
    this.elements.forEach((element) => element.init());
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
      const { value } = el;
      r[key] = value !== null && value.data !== undefined ? value.data : value;
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
      const { value } = el;
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

  /**
   * Creates a copy of the element description and modifies the description:
   * - generate a unique id based on the form id
   * - add css class for bootstrap theme
   *
   * @param desc form element desc
   * @param formId id of the form the element will be append to
   */
  static updateElementDesc(desc: IFormElementDesc, formId: string): IFormElementDesc {
    const elementDesc = { ...desc }; // create copy

    // inject formId into form element id
    const uid = `${elementDesc.id}_${formId}`;

    elementDesc.attributes = elementDesc.attributes || {};
    elementDesc.attributes.id = uid; // add id as attribute
    elementDesc.attributes.clazz = elementDesc.attributes.clazz || '';
    if (elementDesc.type === 'FormSelect') {
      elementDesc.attributes.clazz += ' form-select';
    } else if (elementDesc.type === 'FormButton') {
      elementDesc.attributes.clazz += ' btn btn-light btn-sm';
    }

    return elementDesc;
  }
}
