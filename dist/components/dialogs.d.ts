import '../webpack/_bootstrap';
import { Modal } from 'bootstrap';
export interface IDialogOptions {
    title?: string;
    placeholder?: string;
    primaryBtnText?: string;
    additionalCSSClasses?: string;
}
export interface IPromptOptions extends IDialogOptions {
    multiline?: boolean;
}
export interface IChooseOptions extends IDialogOptions {
    editable?: boolean;
}
export interface IAreYouSureOptions extends Pick<IDialogOptions, 'title' | 'additionalCSSClasses'> {
    button?: string;
    cancelButton?: string;
}
export declare class Dialog {
    protected readonly bsModal: Modal;
    protected readonly modalElement: Element;
    private bakKeyDownListener;
    static openDialogs: number;
    /**
     * @param title Dialog title
     * @param primaryBtnText Label for primary button
     * @param additionalCSSClasses additional css classes for the dialog
     * @param backdrop sets backdrop option for bootstrap modal
     *
     * false: show no backdrop;
     *
     * true: show backdrop, dialog closes on click outside;
     *
     * static: show backdrop, dialog does not close on click outside;
     * @default backdrop true
     */
    constructor(title: string, primaryBtnText?: string, additionalCSSClasses?: string, backdrop?: boolean | 'static');
    show(): void;
    hide(): void;
    get body(): HTMLDivElement;
    get footer(): HTMLDivElement;
    get header(): HTMLDivElement;
    onHide(callback: () => void): void;
    onSubmit(callback: () => any): void;
    hideOnSubmit(): void;
    destroy(): void;
    static generateDialog(title: string, primaryBtnText?: string, additionalCSSClasses?: string): Dialog;
    static msg(text: string, category?: string): Promise<void>;
    /**
     * simple prompt dialog
     * @param text
     * @param options
     * @returns {Promise}
     */
    static prompt(text: string, options?: IPromptOptions | string): Promise<string>;
}
export declare class PHOVEA_UI_FormDialog extends Dialog {
    constructor(title: string, primaryBtnText?: string, formId?: string, additionalCSSClasses?: string);
    get form(): HTMLFormElement;
    getFormData(): FormData;
    onSubmit(callback: () => boolean): void;
    /**
     * simple choose dialog
     * @param items
     * @param options
     * @returns {Promise}
     */
    static choose(items: string[], options?: IChooseOptions | string): Promise<string>;
    static areyousure(msg?: string, options?: IAreYouSureOptions | string): Promise<boolean>;
}
//# sourceMappingURL=dialogs.d.ts.map