import { EventHandler, IEventHandler } from '../base/event';
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
    /**
     * clear the specific selection (type) and dimension
     */
    clear(): Promise<any>;
    clear(type: string): Promise<any>;
    clear(dim: number): Promise<any>;
    clear(dim: number, type: string): Promise<any>;
}
export declare abstract class ASelectAble extends EventHandler {
    static readonly EVENT_SELECT = "select";
}
//# sourceMappingURL=ASelectAble.d.ts.map