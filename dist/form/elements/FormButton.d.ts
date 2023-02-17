import { IPluginDesc } from 'visyn_core/plugin';
import { EventHandler } from 'visyn_core/base';
import { FormElementType, IFormElement, IFormElementDesc, IForm } from '../interfaces';
export interface IButtonElementDesc extends IFormElementDesc {
    type: FormElementType.BUTTON;
    onClick: () => void;
    iconClass?: string;
}
export declare class FormButton extends EventHandler implements IFormElement {
    readonly form: IForm;
    readonly elementDesc: IButtonElementDesc;
    readonly pluginDesc: IPluginDesc;
    private $button;
    private $node;
    private clicked;
    readonly type: FormElementType.BUTTON;
    readonly id: string;
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form: IForm, elementDesc: IButtonElementDesc, pluginDesc: IPluginDesc);
    /**
     * Set the visibility of an form element - needed by IFormElement
     * @param visible
     */
    setVisible(visible: boolean): void;
    get value(): boolean;
    set value(clicked: boolean);
    validate(): boolean;
    /**
     * Build the current element and add the DOM element to the form DOM element.
     * @param $formNode The parent node this element will be attached to
     */
    build($formNode: any): void;
    init(): void;
    focus(): void;
}
//# sourceMappingURL=FormButton.d.ts.map