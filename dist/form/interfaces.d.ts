import * as d3v3 from 'd3v3';
import { IEventHandler } from '../base';
/**
 * List of all available for elements that the form builder can handle
 * @see FormBuilder.appendElement()
 */
export declare enum FormElementType {
    /**
     * shows a simple select box
     * @see IFormSelectDesc
     */
    SELECT = "FormSelect",
    /**
     * shows a select box based on select2
     * @see IFormSelect2
     */
    SELECT2 = "FormSelect2",
    /**
     * similar to SELECT2 but with multiple selections allowed
     */
    SELECT2_MULTIPLE = "FormSelect2Multiple",
    /**
     * SELECT2 with additional functionality such as validation, tokenize and file drag
     */
    SELECT3 = "FormSelect3",
    /**
     * similar to SELECT3 but with multiple selections allowed
     */
    SELECT3_MULTIPLE = "FormSelect3Multiple",
    /**
     * a text field
     * @see IFormInputTextDesc
     */
    INPUT_TEXT = "FormInputText",
    /**
     * a complex dynamic sub map form element
     * @see IFormMapDesc
     */
    MAP = "FormMap",
    /**
     * a simple button
     * @see IButtonElementDesc
     */
    BUTTON = "FormButton",
    /**
     * a checkbox
     * @see ICheckBoxElementDesc
     */
    CHECKBOX = "FormCheckBox",
    /**
     * a checkbox
     * @see IRadioElementDesc
     */
    RADIO = "FormRadio"
}
/**
 * The description is used to build the form element
 */
export interface IFormElementDesc {
    /**
     * Choose a type which element should be created
     */
    type: FormElementType | string;
    /**
     * Unique identifier for each page
     */
    id: string;
    /**
     * Label for the form element
     */
    label?: string;
    /**
     * Show or hide form element
     */
    visible?: boolean;
    /**
     * is this field required
     */
    required?: boolean;
    /**
     * Attributes that are applied to the DOM element
     */
    attributes?: {
        /**
         * Note: Used `clazz` instead of the DOM property `class`, due to JS reserved keyword
         */
        clazz?: string;
        /**
         * Id attribute can be set independently from the `id` property above or will be copied if empty
         */
        id?: string;
        /**
         * Style attribute
         */
        style?: string;
    };
    /**
     * Id of a different form element where an on change listener is attached to
     */
    dependsOn?: string[];
    /**
     *
     */
    showIf?: (dependantValue: any[]) => boolean;
    /**
     * Whether to store the value in a session or not
     */
    useSession?: boolean;
    /**
     * Form element specific options
     */
    options?: {
        /**
         * Add property to check for inline forms explicitely.
         */
        inlineForm?: boolean;
        /**
         * Any other property.
         */
        [key: string]: any;
    };
    /**
     * hide label
     */
    hideLabel?: boolean;
    /**
     * generic on change handler
     * @param {IFormElement} formElement
     * @param value the current value
     * @param data the data associated with the the value, i.e. value.data || value
     * @param previousValue the previous value
     */
    onChange?: (formElement: IFormElement, value: any, data: any, previousValue: any) => void;
    onInit?: (formElement: IFormElement, value: any, data: any, previousValue: any) => void;
}
export interface IForm {
    /**
     * Append a form element and builds it
     * Note: The initialization of the element must be done using `initAllElements()`
     * @param element Form element
     */
    appendElement(element: IFormElement): any;
    /**
     * Append multiple form element at once and build them
     * Note: The initialization of the element must be done using `initAllElements()`
     * @param element Form element
     */
    appendElements(element: IFormElement[]): any;
    /**
     * Initialize all elements of this form
     * At this stage it is possible to reference dependencies to other form fields
     */
    initAllElements(): any;
    /**
     * Retrieve element by identifer
     * @param id element identifier
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
    validate(): any;
    /**
     * number of form elements
     */
    readonly length: number;
}
/**
 * Describes public properties of a form element instance
 */
export interface IFormElement extends IEventHandler {
    /**
     * Unique identifier of the element within the form
     */
    readonly id: string;
    /**
     * Form element value
     */
    value: any;
    /**
     * Build the current element and add the DOM element to the form DOM element.
     * @param $formNode The parent node this element will be attached to
     */
    build($formNode: d3v3.Selection<any>): void;
    /**
     * Initialize the current element
     * It is possible to reference to other elements (e.g., form.getElementById) in this stage
     */
    init(): void;
    /**
     * Set the visibility of an form element
     * @param visible
     */
    setVisible(visible: boolean): void;
    /**
     * validates this field
     */
    validate(): boolean;
    /**
     * sets the focus to the element (e.g. opens a dropdown, etc.)
     */
    focus(): void;
}
//# sourceMappingURL=interfaces.d.ts.map