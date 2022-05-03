import * as d3 from 'd3';
import { ITypeDefinition, ValueTypeEditor } from './valuetype/valuetypes';
import { IDataDescription } from '../data';
export interface IColumnDefinition {
    name: string;
    column: string | number;
    value: ITypeDefinition;
}
export declare class ImportUtils {
    static commonFields(name: string): string;
    static extractCommonFields($root: d3.Selection<any>): {
        name: any;
        description: any;
    };
    static importTable(editors: ValueTypeEditor[], $root: d3.Selection<any>, header: string[], data: string[][], name: string): Promise<() => {
        data: string[][];
        desc: IDataDescription;
    }>;
    static toTableDataDescription(config: IColumnDefinition[], data: any[], common: {
        name: string;
        description: string;
    }): IDataDescription;
    static importMatrix(editors: ValueTypeEditor[], $root: d3.Selection<any>, header: string[], data: string[][], name: string): Promise<() => {
        rows: string[];
        cols: string[];
        data: string[][];
        desc: IDataDescription;
    }>;
}
//# sourceMappingURL=ImportUtils.d.ts.map