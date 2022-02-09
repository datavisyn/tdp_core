import { AView } from './AView';
import { IViewContext, ISelection } from '../base/interfaces';
import { SelectionChooser, ISelectionChooserOptions } from './SelectionChooser';
export interface IProxyViewChooserOptions extends Partial<ISelectionChooserOptions> {
    /**
     * site name
     */
    name: string;
    /**
     * proxy key - will be redirected through a local server proxy
     */
    proxy: string;
    /**
     * direct loading of an iframe site
     */
    site: string;
    /**
     * within the url {argument} will be replaced with the current selected id
     * @default gene
     */
    argument: string;
    /**
     * idtype of the argument
     */
    idtype: string;
    /**
     * extra object for the link generation
     */
    extra: object;
    /**
     * flag whether just an open externally link should be shown,
     * i.e. in case iframe is prohibited
     * @default false
     */
    openExternally: boolean;
}
export declare class ChooserProxyView extends AView {
    protected options: IProxyViewChooserOptions;
    protected readonly chooser: SelectionChooser;
    private readonly openExternally;
    readonly naturalSize: number[];
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: Partial<IProxyViewChooserOptions>);
    init(params: HTMLElement, onParameterChange: (name: string, value: any, previousValue: any) => Promise<any>): Promise<any>;
    protected initImpl(): Promise<void>;
    protected getParameterFormDescs(): import("..").IFormElementDesc[];
    protected selectionChanged(): Promise<void>;
    protected parameterChanged(name: string): void;
    protected createUrl(args: any): string;
    protected build(): void;
    protected showErrorMessage(): void;
    private static isNoNSecurePage;
    private showNoHttpsMessage;
}
//# sourceMappingURL=ChooserProxyView.d.ts.map