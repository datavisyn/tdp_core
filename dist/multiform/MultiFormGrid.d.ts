import { IDataType } from '../data';
import { Rect } from '../geom';
import { IVisMetaData, IVisInstance, IVisPluginDesc, AVisInstance, ITransform } from '../provvis';
import { IMultiForm, IMultiFormOptions } from './IMultiForm';
import { Range } from '../range';
export interface IViewFactory {
    (data: IDataType, range: Range, pos: number[]): IDataType;
}
export interface IMultiFormGridOptions extends IMultiFormOptions {
    singleRowOptimization?: boolean;
    wrap?(cell: HTMLElement, data: IDataType, range: Range, pos: number[]): HTMLElement;
}
/**
 * a simple multi form class using a select to switch
 */
export declare class MultiFormGrid extends AVisInstance implements IVisInstance, IMultiForm {
    readonly data: IDataType;
    readonly range: Range;
    private options;
    readonly node: HTMLElement;
    /**
     * list of all possibles vis techniques
     */
    readonly visses: IVisPluginDesc[];
    private actDesc;
    private actVisPromise;
    private content;
    private dims;
    private grid;
    private _metaData;
    constructor(data: IDataType, range: Range, parent: HTMLElement, viewFactory: IViewFactory, options?: IMultiFormGridOptions);
    get dimSizes(): number[];
    private toElem;
    getRange(...indices: number[]): any;
    getData(...indices: number[]): IDataType;
    getBounds(...indices: number[]): Rect;
    /**
     * converts this multiform to a vis metadata
     * @return {IVisMetaData}
     */
    get asMetaData(): IVisMetaData;
    private build;
    destroy(): void;
    transform(scale?: [number, number], rotate?: number): ITransform;
    persist(): any;
    restore(persisted: any): Promise<MultiFormGrid>;
    private locateGroup;
    locateGroupById(range: Range): any;
    locate(...range: Range[]): Promise<any>;
    locateById(...range: Range[]): Promise<any>;
    /**
     * returns the current selected vis technique description
     * @returns {plugins.IPluginDesc}
     */
    get act(): IVisPluginDesc;
    get actLoader(): Promise<any>;
    gridSize(raw?: boolean): {
        cols: number[];
        rows: number[];
        grid: number[][][];
    };
    get size(): [number, number];
    get rawSize(): [number, number];
    /**
     * switch to the desired vis technique given by index
     * @param param
     */
    switchTo(param: string | number | IVisPluginDesc): Promise<IVisInstance[]>;
    addIconVisChooser(toolbar: HTMLElement): any;
    addSelectVisChooser(toolbar: HTMLElement): any;
    static create(data: IDataType, range: Range, parent: HTMLElement, viewFactory: IViewFactory, options?: IMultiFormGridOptions): MultiFormGrid;
}
