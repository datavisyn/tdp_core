import { EventHandler, IEventHandler, IEventListener } from '../base/event';
import { SelectOperation } from './SelectionUtils';
import { IDType } from './IDType';
export interface ISelectAble extends IEventHandler {
    ids(selectionIndices?: string[]): Promise<string[]>;
    readonly idtypes: IDType[];
    selections(type?: string): Promise<string[]>;
    select(selectionIds: string[]): Promise<string[]>;
    select(selectionIds: string[], op: SelectOperation): Promise<string[]>;
    select(type: string, selectionIds: string[]): Promise<string[]>;
    select(type: string, selectionIds: string[], op: SelectOperation): Promise<string[]>;
    select(dim: number, selectionIds: string[]): Promise<string[]>;
    select(dim: number, selectionIds: string[], op: SelectOperation): Promise<string[]>;
    select(dim: number, type: string, selectionIds: string[]): Promise<string[]>;
    select(dim: number, type: string, selectionIds: string[], op: SelectOperation): Promise<string[]>;
    /**
     * clear the specific selection (type) and dimension
     */
    clear(): Promise<any>;
    clear(type: string): Promise<any>;
    clear(dim: number): Promise<any>;
    clear(dim: number, type: string): Promise<any>;
}
export declare abstract class ASelectAble extends EventHandler implements ISelectAble {
    static readonly EVENT_SELECT = "select";
    private numSelectListeners;
    private selectionListeners;
    private singleSelectionListener;
    private selectionCache;
    private accumulateEvents;
    abstract ids(selectionIds?: string[]): Promise<string[]>;
    get idtypes(): IDType[];
    private selectionListener;
    private fillAndSend;
    on(events: string | {
        [key: string]: IEventListener;
    }, handler?: IEventListener): this;
    off(events: string | {
        [key: string]: IEventListener;
    }, handler?: IEventListener): this;
    selections(type?: string): Promise<string[]>;
    select(selectionIds: string[]): Promise<string[]>;
    select(selectionIds: string[], op: SelectOperation): Promise<string[]>;
    select(type: string, selectionIds: string[]): Promise<string[]>;
    select(type: string, selectionIds: string[], op: SelectOperation): Promise<string[]>;
    select(dim: number, selectionIds: string[]): Promise<string[]>;
    select(dim: number, selectionIds: string[], op: SelectOperation): Promise<string[]>;
    select(dim: number, type: string, selectionIds: string[]): Promise<string[]>;
    select(dim: number, type: string, selectionIds: string[], op: SelectOperation): Promise<string[]>;
    private selectImpl;
    /**
     * clear the specific selection (type) and dimension
     */
    clear(): Promise<any>;
    clear(type: string): Promise<any>;
    clear(dim: number): Promise<any>;
    clear(dim: number, type: string): Promise<any>;
}
