import { FormElementType, IFormElement, IFormElementDesc, IForm } from '../interfaces';
import { EventHandler, IPluginDesc } from 'phovea_core';
export interface IButtonElementDesc extends IFormElementDesc {
    onClick: () => void;
    iconClass?: string;
}
export declare class FormButton extends EventHandler implements IFormElement {
    readonly form: IForm;
    readonly parentElement: HTMLElement;
    readonly desc: IButtonElementDesc;
    readonly pluginDesc: IPluginDesc;
    private button;
    private node;
    private clicked;
    readonly type: FormElementType.BUTTON;
    readonly id: string;
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param parentElement The parent node this element will be attached to
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form: IForm, parentElement: HTMLElement, desc: IButtonElementDesc, pluginDesc: IPluginDesc);
    /**
     * Set the visibility of an form element - needed by IFormElement
     * @param visible
     */
    setVisible(visible: boolean): void;
    get value(): boolean;
    set value(clicked: boolean);
    validate(): boolean;
    protected build(): void;
    init(): void;
    focus(): void;
}
