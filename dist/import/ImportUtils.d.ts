import * as d3v3 from 'd3v3';
import { IDataDescription } from '../data';
import { ITypeDefinition, ValueTypeEditor } from './valuetype/valuetypes';
export interface IColumnDefinition {
    name: string;
    column: string | number;
    value: ITypeDefinition;
}
export declare class ImportUtils {
    static commonFields(name: string): string;
    static extractCommonFields($root: d3v3.Selection<any>): {
        name: any;
        description: any;
    };
    static importTable(editors: ValueTypeEditor[], $root: d3v3.Selection<any>, header: string[], data: string[][], name: string): Promise<() => {
        data: string[][];
        desc: IDataDescription;
    }>;
    static toTableDataDescription(config: IColumnDefinition[], data: any[], common: {
        name: string;
        description: string;
    }): IDataDescription;
    static importMatrix(editors: ValueTypeEditor[], $root: d3v3.Selection<any>, header: string[], data: string[][], name: string): Promise<() => {
        rows: string[];
        cols: string[];
        data: string[][];
        desc: IDataDescription;
    }>;
}
//# sourceMappingURL=ImportUtils.d.ts.map