/*********************************************************
 * Copyright (c) 2018 datavisyn GmbH, http://datavisyn.io
 *
 * This file is property of datavisyn.
 * Code and any other files associated with this project
 * may not be copied and/or distributed without permission.
 *
 * Proprietary and confidential. No warranty.
 *
 *********************************************************/
import { IViewProvider } from '../lineup/IViewProvider';
import { ISelection, IView, IViewPluginDesc } from '../base/interfaces';
import { EventHandler } from '../base';
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
    selectionText(selection: any, idType: string): string;
    static guessIDType(v: IViewPluginDesc): IDType | null;
}
