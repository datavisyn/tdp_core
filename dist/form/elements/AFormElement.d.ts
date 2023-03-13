import { Selection } from 'd3v3';
import { IPluginDesc } from 'visyn_core';
import { EventHandler } from 'visyn_core';
import { IFormElementDesc, IForm, IFormElement } from '../interfaces';
/**
 * Abstract form element class that is used as parent class for other form elements
 */
export declare abstract class AFormElement<T extends IFormElementDesc> extends EventHandler implements IFormElement {
    protected readonly form: IForm;
    protected readonly elementDesc: T;
    protected readonly pluginDesc: IPluginDesc;
    static readonly EVENT_CHANGE = "change";
    static readonly EVENT_INITIAL_VALUE = "initial";
    readonly id: string;
    protected $rootNode: Selection<any>;
    protected $inputNode: Selection<any> | null;
    protected previousValue: any;
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form: IForm, elementDesc: T, pluginDesc: IPluginDesc);
    protected updateStoredValue(): void;
    protected getStoredValue<D>(defaultValue: D): D;
    protected hasStoredValue(): boolean;
    isRequired(): boolean;
    validate(): boolean;
    protected hasValue(): boolean;
    isVisible(): boolean;
    /**
     * Set the visibility of an form element (default = true)
     * @param visible
     */
    setVisible(visible?: boolean): void;
    protected addChangeListener(): void;
    protected triggerValueChanged(): void;
    /**
     * Build the current element and add the DOM element to the form DOM element.
     * The implementation of this function must set the `$node` property!
     */
    abstract build($formNode: Selection<any>): any;
    /**
     * Initialize dependent form fields, bind the change listener, and propagate the selection by firing a change event
     */
    init(): void;
    /**
     * Append a label to the node element if `hideLabel = false` in the element description
     */
    protected appendLabel($node: Selection<any>): Selection<any>;
    /**
     * Set a list of object properties and values to a given node
     * Note: Use `clazz` instead of the attribute `class` (which is a reserved keyword in JavaScript)
     * @param $node
     * @param attributes Plain JS object with key as attribute name and the value as attribute value
     */
    protected setAttributes($node: Selection<any>, attributes: {
        [key: string]: any;
    }): void;
    protected handleDependent(onDependentChange?: (values: any[]) => void): any[];
    /**
     * Returns the form element value
     * @returns {string}
     */
    abstract get value(): any;
    /**
     * Set the form element value
     * @param v
     */
    abstract set value(v: any);
    abstract focus(): any;
    static toData(value: any): any;
    /**
     * Factory method to create form elements for the phovea extension type `tdpFormElement`.
     * An element is found when `desc.type` is matching the extension id.
     *
     * @param form the form to which the element will be appended
     * @param $parent parent D3 selection element
     * @param elementDesc form element description
     */
    static createFormElement(form: IForm, elementDesc: IFormElementDesc): Promise<IFormElement>;
}
//# sourceMappingURL=AFormElement.d.ts.map