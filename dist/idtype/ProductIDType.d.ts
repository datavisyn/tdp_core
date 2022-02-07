import { EventHandler, IEventListener } from '../base/event';
import { Range, RangeLike } from '../range';
import { SelectOperation } from './SelectionUtils';
import { IIDType } from './IIDType';
import { IDType } from './IDType';
/**
 * a product idtype is a product of multiple underlying ones, e.g. patient x gene.
 */
export declare class ProductIDType extends EventHandler implements IIDType {
    readonly elems: IDType[];
    readonly internal: boolean;
    static readonly EVENT_SELECT_DIM = "selectDim";
    static readonly EVENT_SELECT_PRODUCT = "selectProduct";
    private sel;
    private isOn;
    private selectionListener;
    constructor(elems: IDType[], internal?: boolean);
    on(events: string | {
        [key: string]: IEventListener;
    }, listener?: IEventListener): this;
    get id(): string;
    get name(): string;
    get names(): string;
    private enable;
    private disable;
    persist(): {
        sel: any;
    };
    restore(persisted: any): this;
    toString(): string;
    selectionTypes(): string[];
    /**
     * return the current selections of the given type
     * @param type optional the selection type
     * @returns {Range[]}
     */
    selections(type?: string): Range[];
    productSelections(type?: string): Range[];
    /**
     * select the given range as
     * @param range
     */
    select(range: RangeLike[]): Range[];
    select(range: RangeLike[], op: SelectOperation): Range[];
    select(type: string, range: RangeLike[]): Range[];
    select(type: string, range: RangeLike[], op: SelectOperation): Range[];
    private selectImpl;
    private toPerDim;
    clear(type?: string): Range[];
}
//# sourceMappingURL=ProductIDType.d.ts.map