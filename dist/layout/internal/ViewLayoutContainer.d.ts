import { ILayoutDump, ISize, IViewLayoutContainer, PHOVEA_UI_IView } from '../interfaces';
import { ALayoutContainer, ILayoutContainerOption } from './ALayoutContainer';
export interface IViewLayoutContainerOptions extends ILayoutContainerOption {
    hideHeader: boolean;
}
export declare class HTMLView implements PHOVEA_UI_IView {
    readonly minSize: ISize;
    visible: boolean;
    readonly node: HTMLElement;
    constructor(html: string, doc: Document);
    destroy(): void;
    resized(): void;
    dumpReference(): number;
}
export declare class NodeView implements PHOVEA_UI_IView {
    readonly node: HTMLElement;
    readonly minSize: ISize;
    visible: boolean;
    constructor(node: HTMLElement);
    destroy(): void;
    resized(): void;
    dumpReference(): number;
}
export declare class ViewLayoutContainer extends ALayoutContainer<IViewLayoutContainerOptions> implements IViewLayoutContainer {
    readonly view: PHOVEA_UI_IView;
    readonly node: HTMLElement;
    readonly type = "view";
    constructor(view: PHOVEA_UI_IView, options: Partial<ILayoutContainerOption>);
    protected defaultOptions(): IViewLayoutContainerOptions & {
        hideHeader: boolean;
    };
    get hideAbleHeader(): boolean;
    get visible(): boolean;
    set visible(visible: boolean);
    get minSize(): [number, number];
    resized(): void;
    destroy(): void;
    persist(): ILayoutDump;
    static restore(dump: ILayoutDump, restoreView: (referenceId: number) => PHOVEA_UI_IView, doc: Document): ViewLayoutContainer;
    static derive(view: PHOVEA_UI_IView): ViewLayoutContainer;
}
//# sourceMappingURL=ViewLayoutContainer.d.ts.map