import { IDataDescription } from './DataDescription';
import { IDataType } from './datatype';
export declare class DataUtils {
    /**
     * creates a default data description
     * @return {{type: string, id: string, name: string, fqname: string, description: string, creator: string, ts: number}}
     */
    static createDefaultDataDesc(namespace?: string): IDataDescription;
    /**
     * utility to assign a dataset to an html element, similar to d3
     * @param node
     * @param data
     */
    static assignData(node: Element, data: IDataType): void;
    /**
     * transpose the given matrix
     * @param m
     * @returns {*}
     */
    static transpose(m: any[][]): any[][];
    /**
     * utility function to create a datatype, designed for JavaScript usage
     * @param name
     * @param functions the functions to add
     * @return {function(IDataDescription): undefined}
     */
    static defineDataType(name: string, functions: any): {
        (this: any, desc: IDataDescription): void;
        prototype: any;
    };
}
