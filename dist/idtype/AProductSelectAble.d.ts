import { IEventListener } from '../base/event';
import { Range, RangeLike } from '../range';
import { SelectOperation } from './SelectionUtils';
import { ASelectAble, ISelectAble } from './ASelectAble';
import { ProductIDType } from './ProductIDType';
export interface IProductSelectAble extends ISelectAble {
    producttype: ProductIDType;
    productSelections(type?: string): Promise<Range[]>;
    selectProduct(range: RangeLike[], op?: SelectOperation): Promise<Range[]>;
    selectProduct(type: string, range: RangeLike[], op?: SelectOperation): Promise<Range[]>;
}
export declare abstract class AProductSelectAble extends ASelectAble {
    private numProductSelectListeners;
    private productSelectionListener;
    abstract get producttype(): ProductIDType;
    on(events: string | {
        [key: string]: IEventListener;
    }, handler?: IEventListener): this;
    off(events: string | {
        [key: string]: IEventListener;
    }, handler?: IEventListener): this;
    productSelections(type?: string): Promise<Range[]>;
    selectProduct(range: RangeLike[], op?: SelectOperation): Promise<Range[]>;
    selectProduct(type: string, range: RangeLike[], op?: SelectOperation): Promise<Range[]>;
    private selectProductImpl;
    /**
     * clear the specific selection (type) and dimension
     */
    clear(): Promise<Range[]>;
    clear(type: string): Promise<Range[]>;
    clear(dim: number): Promise<Range[]>;
    clear(dim: number, type: string): Promise<Range[]>;
}
