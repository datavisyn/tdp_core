import { AD3View } from './AD3View';
import { ISelection, IViewContext } from '../base/interfaces';
import { IFormSelectOption } from '../form/elements/FormSelect';
export interface IProxyViewOptions {
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
    protected options: IProxyViewOptions;
    private readonly openExternally;
    readonly naturalSize: number[];
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: Partial<IProxyViewOptions>);
    init(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>): Promise<any>;
    protected initImpl(): Promise<void>;
    protected createUrl(args: any): string;
    protected getParameterFormDescs(): import("../form/interfaces").IFormElementDesc[];
    protected parameterChanged(name: string): void;
    protected selectionChanged(): void;
    protected updateSelectedItemSelect(forceUseLastSelection?: boolean): Promise<void>;
    protected getSelectionSelectData(names: string[]): Promise<IFormSelectOption[]>;
    protected updateProxyView(): void;
    protected loadProxyPage(selectedItemId: string): void;
    protected showErrorMessage(selectedItemId: string): void;
    private static isNoNSecurePage;
    private showNoHttpsMessage;
    static create(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: Partial<IProxyViewOptions>): ProxyView;
}
//# sourceMappingURL=ProxyView.d.ts.map