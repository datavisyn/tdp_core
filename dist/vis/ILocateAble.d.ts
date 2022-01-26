import { IDataType } from '../data/datatype';
/**
 *
 */
export interface ILocateAble {
    /**
     * data represented by this vis
     */
    data: IDataType;
    /**
     * locate method, by convention, when just a single range is given, then return
     * just a promise with this range, else an array
     * the return type should be something convertable using the geom module
     */
    locate(...selectionIds: string[][]): Promise<any>;
    locateById(...selectionIndices: string[][]): Promise<any>;
}
