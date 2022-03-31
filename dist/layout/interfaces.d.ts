import { IEventHandler } from '../base';
/**
 * [width, height]
 */
export declare type ISize = [number, number];
export interface IBuilder {
    autoWrap(name?: string): IBuilder;
    name(name: string): IBuilder;
    fixed(): IBuilder;
    fixedLayout(): IBuilder;
}
export declare type IBuildAbleOrViewLike = IBuilder | PHOVEA_UI_IView | string;
export declare class LayoutContainerEvents {
    static readonly EVENT_LAYOUT_CHANGED = "changed";
    static readonly EVENT_DESTROYED = "destroy";
    static readonly EVENT_VISIBILITY_CHANGED = "visibilityChanged";
    static readonly EVENT_NAME_CHANGED = "nameChanged";
    static readonly EVENT_CHILD_ADDED = "addChild";
    static readonly EVENT_CHILD_REMOVED = "removeChild";
    static readonly EVENT_CHANGE_SPLIT_RATIOS = "changeRatios";
    static readonly EVENT_TAB_REORDED = "tabReorded";
    static readonly EVENT_CHANGE_ACTIVE_TAB = "changeActiveTab";
    static readonly EVENT_MAXIMIZE = "maximize";
    static readonly EVENT_RESTORE_SIZE = "restoreSize";
}
/**
 * base interface for the container
 */
export interface ILayoutContainer extends IEventHandler {
    /**
     * Unique id of the layout container.
     */
    id: number;
    /**
     * the container type
     */
    readonly type: 'view' | 'tabbing' | 'split' | 'lineup' | 'root';
    /**
     * parent container or null if there is none anymore
     */
    readonly parent: ILayoutParentContainer | null;
    /**
     * HTML node managed by this container
     */
    readonly node: HTMLElement;
    /**
     * HTML header node managed by this container
     */
    readonly header: HTMLElement;
    /**
     * minimum size of this container
     */
    readonly minSize: ISize;
    /**
     * can the header be hidden if needed
     */
    readonly hideAbleHeader: boolean;
    /**
     * whether the view should be automatically wrapped in a tabbing environment upon split drop
     * false ... no
     * true ... yes
     * string ... named of wrapped container
     */
    readonly autoWrapOnDrop: boolean | string;
    /**
     * name of this container
     */
    name: string;
    /**
     * visibility state of this container
     */
    visible: boolean;
    /**
     * notification that the size of the container has changed
     */
    resized(): void;
    /**
     * destroys this container
     */
    destroy(): void;
    /**
     * persists the layout in a dumpable version
     * @return {ILayoutDump}
     */
    persist(): ILayoutDump;
    /**
     * find a view by id or function
     * @param {number | ((container: ILayoutContainer) => boolean)} id
     * @return {ILayoutContainer}
     */
    find(id: number | ((container: ILayoutContainer) => boolean)): ILayoutContainer | null;
    findAll(predicate: (container: ILayoutContainer) => boolean): ILayoutContainer[];
    /**
     * find the closest parent matching the given criteria
     */
    closest(id: number | ((container: ILayoutParentContainer) => boolean)): ILayoutParentContainer | null;
}
/**
 * root layout element
 */
export interface IRootLayoutContainer extends ILayoutContainer {
    /**
     * the root element
     */
    root: ILayoutContainer;
    /**
     * build other container based on an existing root
     * @param {IBuildAbleOrViewLike} item
     * @return {ILayoutContainer}
     */
    build(item: IBuildAbleOrViewLike): ILayoutContainer;
    /**
     * restores the given dump inplace
     */
    restore(dump: ILayoutDump, restoreView: (referenceId: number) => PHOVEA_UI_IView): any;
}
export interface ILayoutDump {
    /**
     * container tpye
     */
    type: string;
    /**
     * container name
     */
    name: string;
    /**
     * optional list of children
     */
    children?: ILayoutDump[];
    [key: string]: any;
}
export declare enum EOrientation {
    HORIZONTAL = 0,
    VERTICAL = 1
}
export declare type IDropArea = 'center' | 'left' | 'right' | 'top' | 'bottom' | 'horizontal-scroll' | 'vertical-scroll';
export interface ILayoutParentContainer extends ILayoutContainer, Iterable<ILayoutContainer> {
    /**
     * children of this container
     */
    readonly children: ILayoutContainer[];
    /**
     * shortcut for children.length
     */
    readonly length: number;
    /**
     * shortcut for children.forEach
     */
    forEach(callback: (child: ILayoutContainer, index: number) => void): void;
    /**
     * adds another child to the container
     * @param {ILayoutContainer} child the child to push
     * @return {boolean} true if successful
     */
    push(child: ILayoutContainer): boolean;
    /**
     * replaces one child with another
     * @param {ILayoutContainer} child the child to replace
     * @param {ILayoutContainer} replacement replace with
     * @return {boolean} true if successful
     */
    replace(child: ILayoutContainer, replacement: ILayoutContainer): boolean;
    /**
     * removes a child from the container
     * @param {ILayoutContainer} child the child to remove
     * @return {boolean} true if successful
     */
    remove(child: ILayoutContainer): boolean;
    rootParent?: IRootLayoutContainer & ILayoutParentContainer;
    canDrop?(area: IDropArea): boolean;
    place?(child: ILayoutContainer, reference: ILayoutContainer, area: IDropArea): boolean;
}
export interface ITabbingLayoutContainer extends ILayoutParentContainer {
    /**
     * get or set the active tab
     */
    active: ILayoutContainer;
}
export interface ISplitLayoutContainer extends ILayoutParentContainer {
    /**
     * get or set the ratios between the split elements
     */
    ratios: number[];
    /**
     * set the ratio at a specific index
     * @param {number} index
     * @param {number} ratio
     */
    setRatio(index: number, ratio: number): void;
    /**
     * push with optional ratio
     * @param {ILayoutContainer} child
     * @param {number} index
     * @param {number} ratio
     * @return {boolean}
     */
    push(child: ILayoutContainer, index?: number, ratio?: number): boolean;
}
export interface IViewLayoutContainer extends ILayoutContainer {
    /**
     * the represented view
     */
    readonly view: PHOVEA_UI_IView;
}
/**
 * interface for the actual view
 */
export interface PHOVEA_UI_IView {
    /**
     * HTMLElement of this view
     */
    readonly node: HTMLElement;
    /**
     * the minimal size of this view (currently not considered)
     */
    readonly minSize?: ISize;
    /**
     * visibility state of this view
     */
    visible: boolean;
    /**
     * destroy this views
     */
    destroy(): void;
    /**
     * notification that this view has been resized
     */
    resized?(): void;
    /**
     * determines the unique reference of this view for dumping
     * @return {number} the uid of this view
     */
    dumpReference(): number;
}
//# sourceMappingURL=interfaces.d.ts.map