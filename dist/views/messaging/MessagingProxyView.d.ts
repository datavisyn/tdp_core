import { AView } from '../AView';
import { IViewContext, ISelection } from '../../base/interfaces';
export interface IPartialProxyViewOptions {
    /**
     * direct loading of an iframe site
     */
    site: string;
    /**
     * idtype of the argument
     */
    idtype: string;
    /**
     * idType of item selection
     */
    itemIDType: string;
}
export declare class MessagingProxyView extends AView {
    protected options: IPartialProxyViewOptions;
    readonly naturalSize: number[];
    private iframeWindow;
    private messageQueue;
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: Partial<IPartialProxyViewOptions>);
    get itemIDType(): import("visyn_core").IDType;
    protected initImpl(): void;
    private build;
    private onWindowMessage;
    destroy(): void;
    protected selectionChanged(name?: string): void;
    protected itemSelectionChanged(name?: string): Promise<void>;
    protected parameterChanged(name: string): void;
    private sendInputSelectionMessage;
    private sendMessage;
    private sendItemSelectionMessage;
    private sendParameterMessage;
    private static isNoNSecurePage;
    private showNoHttpsMessage;
}
//# sourceMappingURL=MessagingProxyView.d.ts.map