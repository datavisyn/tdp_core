import { Range } from '../range';
import { IValueType } from '../data';
import { IQueryArgs, ITableDataDescription, ITableColumn } from './ITable';
/**
 * @internal
 */
export interface ITableLoader {
    (desc: ITableDataDescription): Promise<{
        rowIds: Range;
        rows: string[];
        objs: any[];
    }>;
}
/**
 * @internal
 */
export interface ITableLoader2 {
    rowIds(desc: ITableDataDescription, range: Range): Promise<Range>;
    rows(desc: ITableDataDescription, range: Range): Promise<string[]>;
    col(desc: ITableDataDescription, column: string, range: Range): Promise<IValueType[]>;
    objs(desc: ITableDataDescription, range: Range): Promise<any[]>;
    data(desc: ITableDataDescription, range: Range): Promise<IValueType[][]>;
    view(desc: ITableDataDescription, name: string, args: any): ITableLoader;
}
export declare class TableLoaderUtils {
    /**
     * @internal
     */
    static viaAPIViewLoader(name: string, args: IQueryArgs): ITableLoader;
    private static maskCol;
    private static maskObjects;
    /**
     * @internal
     */
    static viaAPI2Loader(): ITableLoader2;
    static toFlat(data: any[], vecs: ITableColumn<any>[]): any[][];
    /**
     * @internal
     */
    static viaDataLoader(data: any[], nameProperty: any): (desc: any) => Promise<any>;
    /**
     * @internal
     */
    static adapterOne2Two(loader: ITableLoader): ITableLoader2;
}
//# sourceMappingURL=loader.d.ts.map