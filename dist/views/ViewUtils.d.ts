import { IPluginDesc, ProvenanceGraph, IObjectRef } from 'phovea_core';
import { IViewPluginDesc, IViewContext, ISelection } from '../base/interfaces';
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
    static readonly VIEW_EVENT_DUMP_CHANGE_TRRACK = "dumpChange";
    static toViewPluginDesc(p: IPluginDesc): IViewPluginDesc;
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
}
