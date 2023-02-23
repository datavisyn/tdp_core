import { IDType } from 'visyn_core';
import { EventHandler } from 'visyn_core';
import { IFormElementDesc } from '../form/interfaces';
import { ISelection, IView, IViewContext, EViewMode } from '../base/interfaces';
import { IAuthorizationConfiguration } from '../auth';
/**
 * base class for all views
 */
export declare abstract class AView extends EventHandler implements IView {
    protected readonly context: IViewContext;
    protected selection: ISelection;
    static readonly DEFAULT_SELECTION_NAME = "default";
    /**
     * params(oldValue: ISelection, newSelection: ISelection)
     */
    static readonly EVENT_ITEM_SELECT = "select";
    /**
     * params(namedSet: INamedSet)
     */
    static readonly EVENT_UPDATE_ENTRY_POINT = "update_entry_point";
    /**
     * params()
     */
    static readonly EVENT_LOADING_FINISHED = "loadingFinished";
    /**
     * params(name: string, oldValue: any, newValue: any)
     */
    static readonly EVENT_UPDATE_SHARED = "updateShared";
    readonly idType: IDType;
    readonly node: HTMLElement;
    private params;
    private readonly paramsFallback;
    private readonly shared;
    private paramsChangeListener;
    private readonly itemSelections;
    private readonly selections;
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement);
    /**
     * helper to marks this view busy showing a loading icon
     * @param {boolean} value
     * @param {boolean|string} busyMessage optional loading message hint
     */
    protected setBusy(value: boolean, busyMessage?: string | boolean): void;
    protected setHint(visible: boolean, hintMessage?: string, hintCSSClass?: string): void;
    protected setNoMappingFoundHint(visible: boolean, hintMessage?: string): void;
    init(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>): Promise<any>;
    /**
     * Uses the token manager to run the authorizations defined by `getAuthorizationConfiguration()`.
     * Only authorizations which are not yet stored in the token manager are run, others are skipped.
     * It will show an overlay over the detail view allowing the user to authorize the application.
     */
    protected runAuthorizations(): Promise<void>;
    /**
     * Hook to override returning which authorizations are required for this view.
     * @returns ID(s) or authorization configurations(s) which are required. Defaults to the `authorization` desc entry.
     */
    protected getAuthorizationConfiguration(): Promise<string | string[] | IAuthorizationConfiguration | IAuthorizationConfiguration[] | null>;
    /**
     * hook for custom initialization
     */
    protected initImpl(): any;
    private buildParameterForm;
    /**
     * return a list of FormBuilder element descriptions to build the parameter form
     * @returns {IFormElementDesc[]}
     */
    protected getParameterFormDescs(): IFormElementDesc[];
    getItemSelectionNames(): string[];
    /**
     * finds the element form element based on the given id
     * @param {string} id
     * @returns {IFormElement}
     */
    protected getParameterElement(id: string): import("../form/interfaces").IFormElement;
    /**
     * returns the value of the given parameter
     */
    getParameter(name: string): any;
    protected getParameterData(name: string): any;
    protected changeParameter(name: string, value: any): Promise<void>;
    setParameter(name: string, value: any): void;
    updateShared(name: string, value: any): void;
    protected sharedChanged(_name: string): void;
    protected getShared(name: string): any;
    /**
     * hook triggerd when the parameter has changed
     * @param {string} _name the name of the parameter
     */
    protected parameterChanged(_name: string): void;
    setInputSelection(selection: ISelection, name?: string): void;
    protected getInputSelection(name?: string): ISelection;
    protected getInputSelectionNames(): string[];
    /**
     * hook triggerd when the input selection has changed
     */
    protected selectionChanged(_name?: string): void;
    get itemIDType(): IDType;
    /**
     * resolve the id of the current input selection
     * @returns {Promise<string[]>}
     */
    protected resolveSelection(idType?: IDType): Promise<string[]>;
    setItemSelection(selection: ISelection, name?: string): void;
    /**
     * hook when the item selection has changed
     */
    protected itemSelectionChanged(_name?: string): void;
    getItemSelection(name?: string): ISelection;
    modeChanged(mode: EViewMode): void;
    destroy(): void;
    isRegex(v: string): boolean;
}
//# sourceMappingURL=AView.d.ts.map