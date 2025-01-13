import * as d3v3 from 'd3v3';
import { IForm, IFormElement, IFormElementDesc } from '../interfaces';
/**
 * Builds a form from a given collection of form elements
 */
export declare class Form implements IForm {
    private readonly formId;
    /**
     * DOM node for the form itself
     */
    private readonly $node;
    /**
     * Map of all appended form elements with the element id as key
     */
    private readonly elements;
    /**
     * Constructor
     * @param $parent Node that the form should be attached to
     * @param formId unique form id
     */
    constructor($parent: d3v3.Selection<any>, formId?: string);
    /**
     * Append a form element and builds it
     * Note: The initialization of the element must be done using `initAllElements()`
     * @param element Form element
     */
    appendElement(element: IFormElement): void;
    /**
     * Append multiple form element at once and and build them
     * Note: The initialization of the element must be done using `initAllElements()`
     * @param element Form element
     */
    appendElements(elements: IFormElement[]): void;
    /**
     * Initialize all elements of this form
     * At this stage it is possible to reference dependencies to other form fields
     */
    initAllElements(): void;
    /**
     * number of form elements
     */
    get length(): number;
    /**
     * Returns the form element instance, if exists. Otherwise returns `null`.
     * @param id
     * @returns {IFormElement}
     */
    getElementById(id: string): IFormElement;
    /**
     * Returns an object with the form element id as key and the current data as value
     * @returns {{}}
     */
    getElementData(): {
        [key: string]: any;
    };
    /**
     * Returns an object with the form element id as key and the current form element value
     * @returns {{}}
     */
    getElementValues(): {
        [key: string]: any;
    };
    /**
     * validates the current form
     * @returns {boolean} if valid
     */
    validate(): boolean;
    /**
     * Creates a copy of the element description and modifies the description:
     * - generate a unique id based on the form id
     * - add css class for bootstrap theme
     *
     * @param desc form element desc
     * @param formId id of the form the element will be append to
     */
    static updateElementDesc(desc: IFormElementDesc, formId: string): IFormElementDesc;
}
//# sourceMappingURL=Form.d.ts.map