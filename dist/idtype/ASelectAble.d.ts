import { EventHandler, IEventHandler, IEventListener } from '../base/event';
import { Range, RangeLike } from '../range';
import { SelectOperation } from './SelectionUtils';
import { IDType } from './IDType';
export interface ISelectAble extends IEventHandler {
    ids(range?: RangeLike): Promise<Range>;
    fromIdRange(idRange?: RangeLike): Promise<Range>;
    readonly idtypes: IDType[];
    selections(type?: string): Promise<Range>;
    select(range: RangeLike): Promise<Range>;
    select(range: RangeLike, op: SelectOperation): Promise<Range>;
    select(type: string, range: RangeLike): Promise<Range>;
    select(type: string, range: RangeLike, op: SelectOperation): Promise<Range>;
    select(dim: number, range: RangeLike): Promise<Range>;
    select(dim: number, range: RangeLike, op: SelectOperation): Promise<Range>;
    select(dim: number, type: string, range: RangeLike): Promise<Range>;
    select(dim: number, type: string, range: RangeLike, op: SelectOperation): Promise<Range>;
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
    abstract ids(range?: RangeLike): Promise<Range>;
    fromIdRange(idRange?: RangeLike): Promise<Range>;
    get idtypes(): IDType[];
    private selectionListener;
    private fillAndSend;
    on(events: string | {
        [key: string]: IEventListener;
    }, handler?: IEventListener): this;
    off(events: string | {
        [key: string]: IEventListener;
    }, handler?: IEventListener): this;
    selections(type?: string): Promise<Range>;
    select(range: RangeLike): Promise<Range>;
    select(range: RangeLike, op: SelectOperation): Promise<Range>;
    select(type: string, range: RangeLike): Promise<Range>;
    select(type: string, range: RangeLike, op: SelectOperation): Promise<Range>;
    select(dim: number, range: RangeLike): Promise<Range>;
    select(dim: number, range: RangeLike, op: SelectOperation): Promise<Range>;
    select(dim: number, type: string, range: RangeLike): Promise<Range>;
    select(dim: number, type: string, range: RangeLike, op: SelectOperation): Promise<Range>;
    private selectImpl;
    /**
     * clear the specific selection (type) and dimension
     */
    clear(): Promise<any>;
    clear(type: string): Promise<any>;
    clear(dim: number): Promise<any>;
    clear(dim: number, type: string): Promise<any>;
}
//# sourceMappingURL=ASelectAble.d.ts.map