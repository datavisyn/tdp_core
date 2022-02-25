/** *******************************************************
 * Copyright (c) 2018 datavisyn GmbH, http://datavisyn.io
 *
 * This file is property of datavisyn.
 * Code and any other files associated with this project
 * may not be copied and/or distributed without permission.
 *
 * Proprietary and confidential. No warranty.
 *
 ******************************************************** */
import { IViewProvider } from '../lineup/IViewProvider';
import { ISelection, IView, IViewPluginDesc, IViewWrapperDump } from '../base/interfaces';
import { AView } from '../views/AView';
import { EventHandler, IEvent, IBaseViewPluginDesc } from '../base';
import { ObjectNode, ProvenanceGraph } from '../provenance';
import { IDType } from '../idtype';
export declare class ViewWrapper extends EventHandler implements IViewProvider {
    readonly plugin: IViewPluginDesc;
    private readonly graph;
    private readonly viewOptionGenerator;
    static readonly EVENT_VIEW_INITIALIZED = "viewInitialized";
    static readonly EVENT_VIEW_CREATED = "viewCreated";
    static readonly EVENT_VIEW_DESTROYED = "viewDestroyed";
    private instance;
    private instancePromise;
    private allowed;
    readonly node: HTMLElement;
    readonly content: HTMLElement;
    off(events: typeof ViewWrapper.EVENT_VIEW_CREATED, handler?: (event: IEvent, view: IView) => void): this;
    off(events: typeof ViewWrapper.EVENT_VIEW_INITIALIZED, handler?: (event: IEvent, view: IView) => void): this;
    off(events: typeof ViewWrapper.EVENT_VIEW_DESTROYED, handler?: (event: IEvent, view: IView, viewWrapper: ViewWrapper) => void): this;
    off(events: typeof AView.EVENT_ITEM_SELECT, handler?: (event: IEvent, oldSelection: ISelection, newSelection: ISelection, name: string) => void): this;
    on(events: typeof ViewWrapper.EVENT_VIEW_CREATED, handler?: (event: IEvent, view: IView) => void): this;
    on(events: typeof ViewWrapper.EVENT_VIEW_INITIALIZED, handler?: (event: IEvent, view: IView) => void): this;
    on(events: typeof ViewWrapper.EVENT_VIEW_DESTROYED, handler?: (event: IEvent, view: IView, viewWrapper: ViewWrapper) => void): this;
    on(events: typeof AView.EVENT_ITEM_SELECT, handler?: (event: IEvent, oldSelection: ISelection, newSelection: ISelection, name: string) => void): this;
    fire(events: typeof ViewWrapper.EVENT_VIEW_CREATED, view: IView, viewWrapper: ViewWrapper): this;
    fire(events: typeof ViewWrapper.EVENT_VIEW_INITIALIZED, view: IView, viewWrapper: ViewWrapper): this;
    fire(events: typeof ViewWrapper.EVENT_VIEW_DESTROYED, view: IView, viewWrapper: ViewWrapper): this;
    fire(events: typeof AView.EVENT_ITEM_SELECT, oldSelection: ISelection, newSelection: ISelection, name: string): this;
    /**
     * Provenance graph reference of this object
     */
    readonly ref: ObjectNode<ViewWrapper>;
    /**
     * Provenance graph context
     */
    private context;
    private listenerItemSelect;
    private readonly preInstanceItemSelections;
    private readonly preInstanceParameter;
    private readonly inputSelections;
    constructor(plugin: IViewPluginDesc, graph: ProvenanceGraph, document: Document, viewOptionGenerator?: () => any);
    set visible(visible: boolean);
    get visible(): boolean;
    /**
     * as needed for the lineup contract
     * @returns {any}
     */
    getInstance(): any;
    private createView;
    destroy(): void;
    matchesIDType(idType: IDType): boolean;
    get idType(): IDType;
    private destroyInstance;
    private onParameterChange;
    getParameter(name: string): any;
    setParameterImpl(name: string, value: any): void;
    /**
     * @deprecated use setInputSelection instead
     */
    setParameterSelection(selection?: ISelection): void | PromiseLike<void> | Promise<IView>;
    setInputSelection(selection?: ISelection, name?: string): void | PromiseLike<void> | Promise<IView>;
    private match;
    /**
     * @deprecated use getInputSelection instead
     */
    getParameterSelection(): ISelection;
    getInputSelection(name?: string): ISelection;
    get itemIDType(): IDType | null;
    getItemSelection(name?: string): ISelection;
    setItemSelection(sel: ISelection, name?: string): void;
    update(): void;
    dumpReference(): number;
    dump(): IViewWrapperDump;
    selectionText(selection: any, idType: string): string;
    static guessIDType(v: IBaseViewPluginDesc): IDType | null;
}
//# sourceMappingURL=ViewWrapper.d.ts.map