import { IDataType } from '../data';
import { IVisMetaData, IVisPluginDesc, AVisInstance, ITransform, IVisInstance } from '../vis';
import { IMultiForm, IMultiFormOptions } from './IMultiForm';
import { Range } from '../range';
/**
 * a simple multi form class using a select to switch
 */
export declare class MultiForm extends AVisInstance implements IVisInstance, IMultiForm {
    readonly data: IDataType;
    private options;
    readonly node: HTMLElement;
    /**
     * list of all possibles vis techniques
     */
    readonly visses: IVisPluginDesc[];
    private actVis;
    private actVisPromise;
    private actDesc;
    private content;
    private readonly _metaData;
    constructor(data: IDataType, parent: HTMLElement, options?: IMultiFormOptions);
    /**
     * converts this multiform to a vis metadata
     * @return {IVisMetaData}
     */
    get asMetaData(): IVisMetaData;
    private build;
    destroy(): void;
    persist(): any;
    restore(persisted: any): Promise<MultiForm>;
    locate(...range: Range[]): Promise<any>;
    locateById(...range: Range[]): Promise<any>;
    transform(scale?: [number, number], rotate?: number): ITransform;
    /**
     * returns the current selected vis technique description
     * @returns {plugins.IPluginDesc}
     */
    get act(): IVisPluginDesc;
    get actLoader(): Promise<any>;
    get size(): [number, number];
    get rawSize(): [number, number];
    /**
     * switch to the desired vis technique given by index
     * @param param
     */
    switchTo(param: number | string | IVisPluginDesc): Promise<IVisInstance>;
    addIconVisChooser(toolbar: HTMLElement): void;
    addSelectVisChooser(toolbar: HTMLElement): void;
    static create(data: IDataType, parent: HTMLElement, options?: IMultiFormOptions): MultiForm;
}
