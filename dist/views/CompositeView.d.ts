import { IDType } from '../idtype';
import { EventHandler } from '../base';
import { ISelection, IView, IViewContext, IViewPluginDesc, EViewMode } from '../base/interfaces';
interface IElementDesc {
    key: string;
    loader: () => any;
    factory?: string;
    options?: any;
}
interface ILinkedSelection {
    fromKey: string | '_input' | '_item';
    toKey: string | '_item';
    mode: 'item' | 'input';
}
export interface ICompositeLayout {
    type: 'vsplit' | 'hsplit' | 'hstack' | 'vstack' | 'tabbing';
    keys: (string | ICompositeLayout)[];
    ratios?: number[];
}
export interface ICompositeViewPluginDesc extends IViewPluginDesc {
    elements: IElementDesc[];
    layout?: ICompositeLayout;
    linkedSelections: ILinkedSelection[];
}
export declare function isCompositeViewPluginDesc(desc: any): desc is ICompositeViewPluginDesc;
export interface IACompositeViewOptions {
    showHeaders: boolean;
}
export interface ICompositeInfo {
    key: string;
    desc: IElementDesc;
    create(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: any): IView;
    options?: any;
}
export interface ICompositeSetup {
    elements: ICompositeInfo[];
    layout?: ICompositeLayout;
    linkedSelections: ILinkedSelection[];
}
export declare class CompositeView extends EventHandler implements IView {
    protected readonly context: IViewContext;
    protected selection: ISelection;
    static readonly VIEW_COMPOSITE_EVENT_CHANGE_RATIOS = "changeRatios";
    static readonly VIEW_COMPOSITE_EVENT_SET_ACTIVE_TAB = "setActiveTab";
    private readonly options;
    private readonly root;
    readonly idType: IDType;
    private setup;
    private readonly children;
    private readonly childrenLookup;
    private readonly debounceUpdateEntryPoint;
    private itemSelection;
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: Partial<IACompositeViewOptions>);
    init(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>): Promise<any[]>;
    get node(): HTMLElement;
    private setBusy;
    private build;
    private buildLayout;
    private initChildren;
    update(): void;
    get itemIDType(): IDType;
    updateShared(name: string, value: any): void;
    getParameter(name: string): any;
    setParameter(name: string, value: any): void;
    setInputSelection(selection: ISelection): void;
    setItemSelection(selection: ISelection): void;
    getItemSelection(): ISelection;
    modeChanged(mode: EViewMode): void;
    destroy(): void;
    protected createSetup(): ICompositeSetup | Promise<ICompositeSetup>;
    updateLineUpStats(): void;
    isRegex(v: string): boolean;
}
export {};
//# sourceMappingURL=CompositeView.d.ts.map