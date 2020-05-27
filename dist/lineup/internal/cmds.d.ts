/**
 * Created by Samuel Gratzl on 18.05.2016.
 */
import { IObjectRef, ProvenanceGraph, ICmdResult } from 'phovea_core';
import { LocalDataProvider } from 'lineupjs';
export interface IViewProviderLocal {
    data: LocalDataProvider;
    getInstance(): {
        updateLineUpStats(): any;
    };
}
export declare class LinupTrackingManager {
    private ignoreNext;
    /**
     * set of data provider to ignore
     * @type {Set<LocalDataProvider>}
     */
    private temporaryUntracked;
    private ignore;
    /**
     * tracks whether the ranking was dirty and in case it is waits for the ranking to be ordered again
     * @param ranking
     */
    private dirtyRankingWaiter;
    addRankingImpl(inputs: IObjectRef<any>[], parameter: any): Promise<{
        inverse: import("phovea_core").IAction;
    }>;
    addRanking(provider: IObjectRef<any>, index: number, dump?: any): import("phovea_core").IAction;
    private toSortObject;
    setRankingSortCriteriaImpl(inputs: IObjectRef<any>[], parameter: any): Promise<ICmdResult>;
    setRankingSortCriteria(provider: IObjectRef<any>, rid: number, value: any): import("phovea_core").IAction;
    setSortCriteriaImpl(inputs: IObjectRef<any>[], parameter: any): Promise<ICmdResult>;
    setSortCriteria(provider: IObjectRef<any>, rid: number, columns: {
        asc: boolean;
        col: string;
    }[], isSorting?: boolean): import("phovea_core").IAction;
    setGroupCriteriaImpl(inputs: IObjectRef<any>[], parameter: any): Promise<ICmdResult>;
    setGroupCriteria(provider: IObjectRef<any>, rid: number, columns: string[]): import("phovea_core").IAction;
    setColumnImpl(inputs: IObjectRef<any>[], parameter: any): Promise<ICmdResult>;
    setColumn(provider: IObjectRef<IViewProviderLocal>, rid: number, path: string, prop: string, value: any): import("phovea_core").IAction;
    addColumnImpl(inputs: IObjectRef<IViewProviderLocal>[], parameter: any): Promise<ICmdResult>;
    moveColumnImpl(inputs: IObjectRef<IViewProviderLocal>[], parameter: any): Promise<ICmdResult>;
    addColumn(provider: IObjectRef<IViewProviderLocal>, rid: number, path: string, index: number, dump: any): import("phovea_core").IAction;
    moveColumn(provider: IObjectRef<IViewProviderLocal>, rid: number, path: string, index: number, moveTo: number): import("phovea_core").IAction;
    private delayedCall;
    private rankingId;
    private recordPropertyChange;
    /**
     * Serializes RegExp objects to an IRegexFilter object, which can be stored in the provenance graph.
     * In case a string is passed to this function no serialization is applied.
     *
     * Background information:
     * The serialization step is necessary, because RegExp objects are converted into an empty object `{}` on `JSON.stringify`.
     * ```
     * JSON.stringify(/^123$/gm); // result: {}
     * ```
     *
     * @param value Input string or RegExp object
     * @returns {string | IRegExpFilter} Returns the input string or a plain `IRegExpFilter` object
     */
    private serializeRegExp;
    /**
     * Restores a RegExp object from a given IRegExpFilter object.
     * In case a string is passed to this function no deserialization is applied.
     *
     * @param filter Filter as string or plain object matching the IRegExpFilter
     * @returns {string | RegExp| null} Returns the input string or the restored RegExp object
     */
    private restoreRegExp;
    private trackColumn;
    private untrackColumn;
    private trackRanking;
    private untrackRanking;
    /**
     * clueifies lineup
     * @param lineup the object ref on the lineup provider instance
     * @param graph
     */
    clueify(lineup: IObjectRef<IViewProviderLocal>, graph: ProvenanceGraph): Promise<void>;
    untrack(lineup: IObjectRef<IViewProviderLocal>): Promise<void>;
    withoutTracking<T>(lineup: IObjectRef<IViewProviderLocal>, fun: () => T): PromiseLike<T>;
    private suffix;
    private static instance;
    static getInstance(): LinupTrackingManager;
}
