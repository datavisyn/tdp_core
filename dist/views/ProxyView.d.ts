/**
 * Created by Holger Stitz on 07.09.2016.
 */
import { IViewContext, ISelection } from '../base/interfaces';
import { IFormSelectOption } from '../form/elements/FormSelect';
import { AD3View } from './AD3View';
import { ISelectionChooserOptions, SelectionChooser } from './SelectionChooser';
export interface IProxyViewOptions extends Partial<ISelectionChooserOptions> {
    proxy?: string;
    site?: string;
    argument: string;
    idtype?: string;
    extra: object;
    openExternally: boolean;
}
/**
 * helper view for proxying an existing external website using an iframe
 */
export declare class ProxyView extends AD3View {
    static readonly FORM_ID_SELECTED_ITEM = "externalItem";
    protected readonly chooser: SelectionChooser;
    protected options: IProxyViewOptions;
    private readonly openExternally;
    readonly naturalSize: number[];
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: Partial<IProxyViewOptions>);
    init(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>): Promise<any>;
    protected initImpl(): Promise<void>;
    protected createUrl(args: any): string;
    protected parameterChanged(name: string): void;
    protected getParameterFormDescs(): import("..").IFormElementDesc[];
    protected selectionChanged(): void;
    protected getSelectionSelectData(names: string[]): Promise<IFormSelectOption[]>;
    protected updateProxyView(): void;
    protected loadProxyPage(selectedItemId: string): void;
    protected showErrorMessage(selectedItemId: string): void;
    private static isNoNSecurePage;
    private showNoHttpsMessage;
    static create(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: Partial<IProxyViewOptions>): ProxyView;
}
