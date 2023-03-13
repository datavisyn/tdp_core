import { IEventHandler, EventHandler } from 'visyn_core';
import { IPersistable } from '../../base/IPersistable';
import { IDataType } from '../../data/datatype';
import { ITransform } from './ITransform';
export interface IVisInstanceOptions {
    rotate?: number;
    scale?: [number, number];
}
/**
 * basic interface of an visualization instance
 */
export interface IVisInstance extends IPersistable, IEventHandler {
    /**
     * the unique id of this vis instance
     */
    readonly id: number;
    /**
     * the base element of this vis
     */
    readonly node: Element;
    /**
     * the represented data
     */
    readonly data: IDataType;
    /**
     * current size of this vis
     * @returns [width, height]
     */
    readonly size: [number, number];
    /**
     * the size without transformation applied
     */
    readonly rawSize: [number, number];
    /**
     * flag whether the vis if fully built, if not wait for the 'ready' event
     */
    readonly isBuilt: boolean;
    /**
     * returns the current transformation
     */
    transform(): ITransform;
    /**
     * sets the transformation
     * @param scale [w,h]
     * @param rotate
     */
    transform(scale: [number, number], rotate: number): ITransform;
    /**
     * option getter
     * @param name
     */
    option(name: string): any;
    /**
     * option setter
     * @param name
     * @param value
     */
    option(name: string, value: any): any;
    /**
     * updates this vis
     */
    update(): void;
    /**
     * destroy this vis and deregister handlers,...
     */
    destroy(): void;
}
/**
 * base class for an visualization
 */
export declare class AVisInstance extends EventHandler {
    readonly id: number;
    private _built;
    option(name: string, value?: any): any;
    persist(): any;
    get isBuilt(): boolean;
    protected markReady(built?: boolean): void;
    restore(persisted: any): Promise<AVisInstance>;
    update(): void;
    destroy(): void;
    transform(): ITransform;
    get rawSize(): number[];
    get size(): [number, number];
}
//# sourceMappingURL=visInstance.d.ts.map