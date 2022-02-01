import { IPersistable } from '../../base/IPersistable';
import { IDataType } from '../../data';
import { IVisInstance, ITransform } from '../../provvis';
import { Range } from '../../range';
import { IPlugin } from '../../base/plugin';
/**
 * @internal
 */
export declare class GridElem implements IPersistable {
    readonly range: Range;
    readonly pos: number[];
    readonly data: IDataType;
    actVis: IVisInstance;
    content: HTMLElement;
    constructor(range: Range, pos: number[], data: IDataType);
    setContent(c: HTMLElement): void;
    subrange(r: Range): any;
    get hasOne(): boolean;
    destroy(): void;
    get size(): number[];
    get rawSize(): number[];
    persist(): {
        range: any;
        content: any;
    };
    restore(persisted: any): any;
    switchDestroy(): void;
    build(plugin: IPlugin, options: any): IVisInstance;
    get location(): {
        x: number;
        y: number;
    };
    transform(scale?: [number, number], rotate?: number): ITransform;
}
//# sourceMappingURL=GridElem.d.ts.map