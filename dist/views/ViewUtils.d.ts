import { IDType } from 'visyn_core/idtype';
import type { IViewContext, ISelection, IViewPluginDesc, IInstanceViewExtensionDesc, IBaseViewPluginDesc, IGroupData } from '../base/interfaces';
import type { IObjectRef, ProvenanceGraph } from '../clue/provenance';
import { IPluginDesc } from '../base/plugin';
export interface IGroupedViews<T extends IBaseViewPluginDesc> extends IGroupData {
    views: T[];
}
export declare class ViewUtils {
    /**
     * event when one or more elements are selected for the next level
     * @type {string}
     * @argument selection {ISelection}
     */
    static readonly VIEW_EVENT_ITEM_SELECT = "select";
    static readonly VIEW_EVENT_UPDATE_ENTRY_POINT = "update_entry_point";
    static readonly VIEW_EVENT_LOADING_FINISHED = "loadingFinished";
    static readonly VIEW_EVENT_UPDATE_SHARED = "updateShared";
    static toViewPluginDesc<ReturnType extends IViewPluginDesc = IViewPluginDesc>(p: IPluginDesc): ReturnType;
    static matchLength(s: any, length: number): boolean;
    /**
     * whether the view should be used as small multiple in case of multiple selections
     * @param desc
     * @returns {boolean}
     */
    static showAsSmallMultiple(desc: any): boolean;
    /**
     * whether the view is going to use a chooser for multiple selections
     * @param desc
     * @returns {boolean}
     */
    static willShowChooser(desc: any): boolean;
    /**
     * compares two selections and return true if they are the same
     * @param {ISelection} a
     * @param {ISelection} b
     * @returns {boolean}
     */
    static isSameSelection(a: ISelection, b: ISelection): boolean;
    static createContext(graph: ProvenanceGraph, desc: IPluginDesc, ref: IObjectRef<any>): IViewContext;
    /**
     * finds for the given IDType and selection matching views
     * @param {IDType} idType the idtype to lookfor
     * @param {string[]} selection the current input selection
     * @returns {Promise<IViewPluginDesc[]>} list of views and whether the current selection count matches their requirements
     */
    static findViews(idType: IDType, selection: string[]): Promise<IViewPluginDesc[]>;
    static findAllViews(idType?: IDType): Promise<(IViewPluginDesc & {
        enabled: boolean;
    })[]>;
    private static findViewBase;
    static canAccess(p: any): any;
    static findInstantViews(idType: IDType): Promise<IInstanceViewExtensionDesc[]>;
    private static caseInsensitiveCompare;
    static resolveGroupData(): Map<string, IGroupData>;
    static groupByCategory<Desc extends IBaseViewPluginDesc>(views: Desc[]): IGroupedViews<Desc>[];
}
//# sourceMappingURL=ViewUtils.d.ts.map