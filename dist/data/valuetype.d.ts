/**
 * This file defines interfaces for various data types and their metadata.
 */
export interface IValueTypeDesc {
    type: string;
}
export interface INumberValueTypeDesc extends IValueTypeDesc {
    readonly type: 'int' | 'real';
    /**
     * min, max
     */
    readonly range: [number, number];
    /**
     * missing value
     */
    readonly missing?: number;
}
export interface ICategory {
    readonly name: string;
    readonly color?: string;
    readonly label?: string;
}
export interface ICategoricalValueTypeDesc extends IValueTypeDesc {
    readonly type: 'categorical';
    readonly categories: (ICategory | string)[];
}
export interface IStringValueTypeDesc extends IValueTypeDesc {
    readonly type: 'string';
}
export declare type IValueType = number | string | any;
export declare class ValueTypeUtils {
    static VALUE_TYPE_CATEGORICAL: string;
    static VALUE_TYPE_STRING: string;
    static VALUE_TYPE_REAL: string;
    static VALUE_TYPE_INT: string;
    /**
     * guesses the type of the given value array returning its description
     * @param arr
     * @return {any}
     */
    static guessValueTypeDesc(arr: IValueType[]): IValueTypeDesc;
    private static maskImpl;
    static mask(arr: number | number[], desc: INumberValueTypeDesc): number | number[];
}
//# sourceMappingURL=valuetype.d.ts.map