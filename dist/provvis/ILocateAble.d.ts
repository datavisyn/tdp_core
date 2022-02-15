import { IDataType } from '../data/datatype';
import { Range } from '../range/Range';
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
    locate(...range: Range[]): Promise<any>;
    locateById(...range: Range[]): Promise<any>;
}
//# sourceMappingURL=ILocateAble.d.ts.map