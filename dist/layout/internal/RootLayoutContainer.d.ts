import { AParentLayoutContainer } from './AParentLayoutContainer';
import { IBuildAbleOrViewLike, IDropArea, ILayoutContainer, ILayoutDump, IRootLayoutContainer, PHOVEA_UI_IView } from '../interfaces';
import { ILayoutContainerOption } from './ALayoutContainer';
export declare class RootLayoutContainer extends AParentLayoutContainer<ILayoutContainerOption> implements IRootLayoutContainer {
    readonly build: (layout: IBuildAbleOrViewLike) => ILayoutContainer;
    private readonly restorer;
    readonly minChildCount = 0;
    readonly type = "root";
    private viewDump;
    constructor(document: Document, build: (layout: IBuildAbleOrViewLike) => ILayoutContainer, restorer: (dump: ILayoutDump, restoreView: (referenceId: number) => PHOVEA_UI_IView) => ILayoutContainer);
    set root(root: ILayoutContainer);
    get root(): ILayoutContainer;
    get minSize(): import("..").ISize;
    protected addedChild(child: ILayoutContainer, index: number): void;
    place(child: ILayoutContainer, reference: ILayoutContainer, area: IDropArea): boolean;
    protected takeDownChild(child: ILayoutContainer): void;
    restore(dump: ILayoutDump, restoreView: (referenceId: number) => PHOVEA_UI_IView): void;
    persist(): ILayoutDump & {
        type: string;
    };
    static restore(dump: ILayoutDump, doc: Document, build: IBuildLayout, restorer: IRestoreLayout, restoreView: IViewRestorer): any;
}
interface IBuildLayout {
    (root: RootLayoutContainer, layout: IBuildAbleOrViewLike): ILayoutContainer;
}
interface IViewRestorer {
    (referenceId: number): PHOVEA_UI_IView;
}
interface IRestoreLayout {
    (dump: ILayoutDump, restoreView: IViewRestorer): ILayoutContainer;
}
export {};
//# sourceMappingURL=RootLayoutContainer.d.ts.map