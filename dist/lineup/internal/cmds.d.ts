/**
 * Created by Samuel Gratzl on 18.05.2016.
 */
import { IObjectRef, ProvenanceGraph } from 'phovea_core';
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
    addRankingImpl(inputs: IObjectRef<any>[], parameter: any): any;
    addRanking(provider: IObjectRef<any>, index: number, dump?: any): any;
    private toSortObject;
    setRankingSortCriteriaImpl(inputs: IObjectRef<any>[], parameter: any): any;
    setRankingSortCriteria(provider: IObjectRef<any>, rid: number, value: any): any;
    setSortCriteriaImpl(inputs: IObjectRef<any>[], parameter: any): any;
    setSortCriteria(provider: IObjectRef<any>, rid: number, columns: {
        asc: boolean;
        col: string;
    }[], isSorting?: boolean): any;
    setGroupCriteriaImpl(inputs: IObjectRef<any>[], parameter: any): any;
    setGroupCriteria(provider: IObjectRef<any>, rid: number, columns: string[]): any;
    setColumnImpl(inputs: IObjectRef<any>[], parameter: any): any;
    setColumn(provider: IObjectRef<IViewProviderLocal>, rid: number, path: string, prop: string, value: any): any;
    addColumnImpl(inputs: IObjectRef<IViewProviderLocal>[], parameter: any): any;
    moveColumnImpl(inputs: IObjectRef<IViewProviderLocal>[], parameter: any): any;
    addColumn(provider: IObjectRef<IViewProviderLocal>, rid: number, path: string, index: number, dump: any): any;
    moveColumn(provider: IObjectRef<IViewProviderLocal>, rid: number, path: string, index: number, moveTo: number): any;
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
