/**
 * Find views for a given idtype and number of selected items.
 * The seleted items itself are not considered in this function.
 * @param idtype
 * @param selection
 * @returns {any}
 */
import { IDType } from 'phovea_core';
import { IGroupData, IInstanceViewExtensionDesc, IViewPluginDesc } from '../base/interfaces';
import { Range } from 'phovea_core';
export interface IDiscoveredView {
    enabled: boolean;
    v: IViewPluginDesc;
    disabledReason?: 'selection' | 'security' | 'invalid';
}
export interface IGroupedViews<T extends {
    v: IViewPluginDesc;
}> extends IGroupData {
    views: T[];
}
export declare class FindViewUtils {
    /**
     * finds for the given IDType and selection matching views
     * @param {IDType} idType the idtype to lookfor
     * @param {Range} selection the current input selection
     * @returns {Promise<IDiscoveredView[]>} list of views and whether the current selection count matches their requirements
     */
    static findViews(idType: IDType, selection: Range): Promise<IDiscoveredView[]>;
    static findAllViews(idType?: IDType): Promise<IDiscoveredView[]>;
    private static findViewBase;
    static canAccess(p: any): any;
    static findInstantViews(idType: IDType): Promise<IInstanceViewExtensionDesc[]>;
    private static caseInsensitiveCompare;
    static resolveGroupData(): Map<string, IGroupData>;
    /**
     * groups the given views
     * @param {T[]} views
     * @returns {IGroupedViews[]}
     */
    static groupByCategory<T extends {
        v: IViewPluginDesc;
    }>(views: T[]): IGroupedViews<T>[];
}
