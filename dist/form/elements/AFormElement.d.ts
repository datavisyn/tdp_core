/**
 * Created by Samuel Gratzl on 08.03.2017.
 */
import { EventHandler, IPluginDesc } from 'phovea_core';
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
    protected node: HTMLElement;
    protected previousValue: any;
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form: IForm, elementDesc: T, pluginDesc: IPluginDesc);
    protected updateStoredValue(): void;
    protected getStoredValue<T>(defaultValue: T): T;
    protected hasStoredValue(): boolean;
    isRequired(): boolean;
    validate(): boolean;
    protected hasValue(): boolean;
    isVisible(): boolean;
    /**
     * Set the visibility of an form element
     * @param visible
     */
    setVisible(visible: boolean): void;
    protected addChangeListener(): void;
    protected triggerValueChanged(): void;
    protected build(): void;
    /**
     * Initialize dependent form fields, bind the change listener, and propagate the selection by firing a change event
     */
    init(): void;
    /**
     * Set a list of object properties and values to a given node
     * Note: Use `clazz` instead of the attribute `class` (which is a reserved keyword in JavaScript)
     * @param node
     * @param attributes Plain JS object with key as attribute name and the value as attribute value
     */
    protected setAttributes(node: HTMLElement, attributes: {
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
     * @param parentElement parent DOM element
     * @param elementDesc form element description
     */
    static createFormElement(form: IForm, parentElement: HTMLElement, elementDesc: IFormElementDesc): Promise<IFormElement>;
}
