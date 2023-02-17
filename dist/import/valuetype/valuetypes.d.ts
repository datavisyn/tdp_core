import { IPlugin } from 'visyn_core/plugin';
import { Dialog } from '../../components';
export interface ITypeDefinition {
    type: string;
    [key: string]: any;
}
export interface IValueTypeEditor {
    /**
     * guesses whether the given data is of the given type, returns a confidence value
     * @param name name of the column
     * @param index the index of the column
     * @param data
     * @param accessor
     * @param sampleSize
     * @return the confidence (0 ... not, 1 ... sure) that this is the right value type
     */
    isType(name: string, index: number, data: any[], accessor: (row: any) => string, sampleSize: number): Promise<number> | number;
    /**
     * parses the given value and updates them inplace
     * @return an array containing invalid indices
     */
    parse(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => any): number[];
    /**
     * guesses the type definition options
     * @param def
     * @param data
     * @param accessor
     */
    guessOptions(def: ITypeDefinition, data: any[], accessor: (row: any) => any): Promise<ITypeDefinition> | ITypeDefinition;
    /**
     * opens and editor to edit the options
     * @param def
     */
    edit(def: ITypeDefinition): any;
    /**
     * returns markup to show inside a select box. the markup is either a single option or a whole optgroup with options
     * if it is an optgroup, the editor type is represented as data-type attribute, whereas the subtype is the option's value (e.g. optgroup[data-type=idType], option[value=Ensembl])
     * @param current current editor
     * @param def definition of the editor. E.g. which type the editor is (and which idType the column has if it is an IDTypeEditor)
     */
    getOptionsMarkup(current: ValueTypeEditor, def: ITypeDefinition): Promise<string> | string;
}
export declare class PHOVEA_IMPORTER_ValueTypeUtils {
    static createDialog(title: string, classSuffix: string, onSubmit: () => any): Dialog;
    /**
     * edits the given type definition in place with categories
     * @param definition call by reference argument
     * @return {Promise<R>|Promise}
     */
    static editString(definition: ITypeDefinition): Promise<unknown>;
    static guessString(def: ITypeDefinition, data: any[], accessor: (row: any) => string): ITypeDefinition;
    static parseString(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => string): any[];
    static singleOption(this: ValueTypeEditor, current: ValueTypeEditor): string;
    static string_(): IValueTypeEditor;
    /**
     * edits the given type definition in place with categories
     * @param definition call by reference argument
     * @return {Promise<R>|Promise}
     */
    static editCategorical(definition: ITypeDefinition): Promise<unknown>;
    static guessCategorical(def: ITypeDefinition, data: any[], accessor: (row: any) => string): ITypeDefinition;
    static isCategorical(name: string, index: number, data: any[], accessor: (row: any) => string, sampleSize: number): number;
    static parseCategorical(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => string): any[];
    static categorical(): IValueTypeEditor;
    /**
     * edits the given type definition in place with numerical properties
     * @param definition call by reference argument
     * @return {Promise<R>|Promise}
     */
    static editNumerical(definition: ITypeDefinition): Promise<ITypeDefinition>;
    /**
     * Checks if the given value is an empty string
     * @param value Input value
     * @returns Returns a true if the given value is an empty string. Otherwise returns false.
     */
    static isEmptyString(value: any): boolean;
    /**
     * Checks if the given string is a missing value, i.e., an empty string or NaN.
     * @param value Input string
     * @returns Returns a true if the given value is a missing value. Otherwise returns false.
     */
    static isMissingNumber(value: string): boolean;
    static guessNumerical(def: ITypeDefinition, data: any[], accessor: (row: any) => string): ITypeDefinition;
    static isNumerical(name: string, index: number, data: any[], accessor: (row: any) => string, sampleSize: number): number;
    static parseNumerical(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => string): any[];
    static numerical(): IValueTypeEditor;
    static isBoolean(name: string, index: number, data: any[], accessor: (row: any) => string, sampleSize: number): number;
    static boolean(): IValueTypeEditor;
    /**
     * guesses the value type returning a string
     * @param editors the possible types
     * @param name the name of the column/file for helper
     * @param index the index of this column
     * @param data the data
     * @param accessor to access the column
     * @param options additional options
     * @return {any}
     */
    static guessValueType(editors: ValueTypeEditor[], name: string, index: number, data: any[], accessor: (row: any) => any, options?: IGuessOptions): Promise<ValueTypeEditor>;
    static createTypeEditor(editors: ValueTypeEditor[], current: ValueTypeEditor, def: ITypeDefinition, emptyOne?: boolean): Promise<string>;
    static updateType(editors: ValueTypeEditor[], emptyOne?: boolean): (d: any) => void;
}
export declare class ValueTypeEditor implements IValueTypeEditor {
    private desc;
    private impl;
    constructor(impl: IPlugin);
    get hasEditor(): boolean;
    get isImplicit(): boolean;
    get priority(): any;
    get name(): any;
    get id(): any;
    isType(name: string, index: number, data: any[], accessor: (row: any) => string, sampleSize: number): number | Promise<number>;
    parse(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => any): number[];
    guessOptions(def: ITypeDefinition, data: any[], accessor: (row: any) => any): ITypeDefinition | Promise<ITypeDefinition>;
    edit(def: ITypeDefinition): any;
    getOptionsMarkup(current: ValueTypeEditor, def: ITypeDefinition): any;
    static createCustomValueTypeEditor(name: string, id: string, implicit: boolean, desc: IValueTypeEditor): ValueTypeEditor;
    static EXTENSION_POINT: string;
    static createValueTypeEditor(id: string): Promise<ValueTypeEditor>;
    static createValueTypeEditors(): Promise<ValueTypeEditor[]>;
}
export interface IGuessOptions {
    /**
     * number of samples considered
     */
    sampleSize?: number;
    /**
     * threshold if more than X percent of the samples are numbers it will be detected as number
     * numerical - 0.7
     * categorical - 0.7
     */
    thresholds?: {
        [type: string]: number;
    };
}
//# sourceMappingURL=valuetypes.d.ts.map