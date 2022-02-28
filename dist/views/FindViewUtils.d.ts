import { IGroupData, IInstanceViewExtensionDesc, IViewPluginDesc } from '../base/interfaces';
import { IDType } from '../idtype';
import { IVisynViewPluginDesc } from '../base';
interface IBaseDiscoveryView {
    enabled: boolean;
    disabledReason?: 'selection' | 'security' | 'invalid';
}
export interface IDiscoveredView extends IBaseDiscoveryView {
    v: IViewPluginDesc;
}
export interface IDiscoveredVisynView extends IBaseDiscoveryView {
    v: IVisynViewPluginDesc;
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
     * @param {string[]} selection the current input selection
     * @returns {Promise<IDiscoveredView[]>} list of views and whether the current selection count matches their requirements
     */
    static findViews(idType: IDType, selection: string[]): Promise<IDiscoveredView[]>;
    static findAllViews(idType?: IDType): Promise<IDiscoveredView[]>;
    static findVisynViews(idType?: IDType): Promise<IDiscoveredVisynView[]>;
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
export {};
//# sourceMappingURL=FindViewUtils.d.ts.map