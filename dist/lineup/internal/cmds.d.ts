import { EngineRenderer, LocalDataProvider, TaggleRenderer } from 'lineupjs';
import { IAction, ICmdResult, IObjectRef, ProvenanceGraph } from '../../clue/provenance';
export interface IViewProviderLocal {
    data: LocalDataProvider;
    getInstance(): {
        updateLineUpStats(): any;
    };
}
interface IAggregationParameter {
    /**
     * Ranking ID
     */
    rid: number;
    /**
     * Single or multiple group names
     */
    group: string | string[];
    /**
     * Aggregation value
     */
    value: number | number[];
}
export declare class LineupTrackingManager {
    private ignoreNext;
    /**
     * set of data provider to ignore
     * @type {Set<LocalDataProvider>}
     */
    private temporaryUntracked;
    /**
     * Check if the given event should be ignored.
     * Events are ignored when the event name is:
     * 1. stored in the `LineupTrackingManager.getInstance().ignoreNext`; the variable is set to `null` in this function call
     * 2. or listed in the `LineupTrackingManager.getInstance().temporaryUntracked`
     * @param event The event name
     * @param objectRef The object reference that contains the LineUp data provider
     * @returns Returns `true` if the event should be ignored. Otherwise returns `false`.
     */
    private ignore;
    /**
     * tracks whether the ranking was dirty and in case it is waits for the ranking to be ordered again
     * @param ranking
     */
    private dirtyRankingWaiter;
    static addRankingImpl(inputs: IObjectRef<any>[], parameter: any): Promise<{
        inverse: IAction;
    }>;
    addRanking(provider: IObjectRef<any>, index: number, dump?: any): IAction;
    /**
     * Create an object structure from the LineUp sort event listener that can stored in a provenance graph
     * @param v Object from LineUp sort event listener
     */
    private toSortObject;
    static setRankingSortCriteriaImpl(inputs: IObjectRef<any>[], parameter: any): Promise<ICmdResult>;
    setRankingSortCriteria(provider: IObjectRef<any>, rid: number, value: any): IAction;
    static setSortCriteriaImpl(inputs: IObjectRef<any>[], parameter: any): Promise<ICmdResult>;
    setSortCriteria(provider: IObjectRef<any>, rid: number, columns: {
        asc: boolean;
        col: string;
    }[], isSorting?: boolean): IAction;
    static setGroupCriteriaImpl(inputs: IObjectRef<any>[], parameter: any): Promise<ICmdResult>;
    setGroupCriteria(provider: IObjectRef<any>, rid: number, columns: string[]): IAction;
    setAggregation(provider: IObjectRef<any>, rid: number, group: string | string[], value: number | number[]): IAction;
    static setAggregationImpl(inputs: IObjectRef<any>[], parameter: IAggregationParameter): Promise<{
        inverse: IAction;
    }>;
    static setColumnImpl(inputs: IObjectRef<any>[], parameter: any): Promise<ICmdResult>;
    setColumn(provider: IObjectRef<IViewProviderLocal>, rid: number, path: string, prop: string, value: any): IAction;
    static addColumnImpl(inputs: IObjectRef<IViewProviderLocal>[], parameter: any): Promise<ICmdResult>;
    static moveColumnImpl(inputs: IObjectRef<IViewProviderLocal>[], parameter: any): Promise<ICmdResult>;
    addColumn(provider: IObjectRef<IViewProviderLocal>, rid: number, path: string, index: number, dump: any): IAction;
    moveColumn(provider: IObjectRef<IViewProviderLocal>, rid: number, path: string, index: number, moveTo: number): IAction;
    /**
     * Wrap the callback with a function that delays the execution of the callback.
     * @param callback The provenance function that should be delayed
     * @param timeToDelay Number of milliseconds that callback call should be delayed (default = 100 ms)
     * @param thisCallback Provide a different `this` context for the callback
     * @returns Returns a function that wraps the callback with a setTimeout call to delay the execution
     */
    private delayedCall;
    /**
     * Returns the ID of the current ranking
     * @param provider LineUp local data provider
     * @param ranking LineUp ranking
     */
    private rankingId;
    /**
     * Adds an event listener for the given source and property. The tracking call can be delayed by some milliseconds.
     * @param source The column or ranking that is tracked
     * @param provider LineUp local data provider
     * @param objectRef The object reference that contains the LineUp data provider
     * @param graph The provenance graph where the events should be tracked into
     * @param property The name of the property that is tracked
     * @param delayed Number of milliseconds to delay the tracking call (default is -1 = immediately)
     * @param bufferOrExecute Function that immediately executes the action or buffers LineUp live preview events and executes them when a dialog is confirmed
     */
    private recordPropertyChange;
    /**
     * Adds the event listeners to track column events in the provenance graph.
     * @param provider LineUp local data provider
     * @param objectRef The object reference that contains the LineUp data provider
     * @param graph The provenance graph where the events should be tracked into
     * @param col The column instance that should be tracked
     * @param bufferOrExecute Function that immediately executes the action or buffers LineUp live preview events and executes them when a dialog is confirmed
     */
    private trackColumn;
    /**
     * Removes the event listener from the provided column
     * @param col Column
     */
    private untrackColumn;
    /**
     * Adds the event listeners to ranking events and adds event listeners for all columns of that ranking.
     * @param provider LineUp local data provider
     * @param objectRef The object reference that contains the LineUp data provider
     * @param graph The provenance graph where the events should be tracked into
     * @param ranking The current ranking that should be tracked
     */
    private trackRanking;
    /**
     * Removes the event listener for ranking events from the provided ranking
     * @param ranking LineUp Ranking
     */
    private untrackRanking;
    /**
     * Clueifies the given LineUp instance. Adds event listeners to track add and remove rankings
     * from the local data provider and adds event listeners for ranking events.
     * @param lineup: The LineUp instance
     * @param objectRef The object reference that contains the LineUp data provider
     * @param graph The provenance graph where the events should be tracked into
     * @returns Returns a promise that is waiting for the object reference (LineUp instance)
     */
    clueify(lineup: EngineRenderer | TaggleRenderer, objectRef: IObjectRef<IViewProviderLocal>, graph: ProvenanceGraph): Promise<void>;
    /**
     * Removes the event listener for adding and removing a ranking from the provided LineUp instance.
     * @param objectRef The object reference that contains the LineUp data provider
     * @returns Returns a promise that is waiting for the object reference (LineUp instance)
     */
    untrack(objectRef: IObjectRef<IViewProviderLocal>): Promise<void>;
    /**
     * Execute a given LineUp function without being tracked by the provenance graph
     * @param objectRef The object reference that contains the LineUp data provider
     * @param func Function that is executed without provenance tracking
     * @returns Returns a promise that is waiting for the object reference (LineUp instance)
     */
    withoutTracking<T>(objectRef: IObjectRef<IViewProviderLocal>, func: () => T): PromiseLike<T>;
    /**
     * Adds a given suffix to the list of following parameters (prefix)
     * @param suffix Suffix string that is appended to each prefix
     * @param prefix Multiple parameters that should get the suffix
     * @returns List of combined prefixes with suffixes
     */
    private suffix;
    private static instance;
    static getInstance(): LineupTrackingManager;
}
export {};
//# sourceMappingURL=cmds.d.ts.map