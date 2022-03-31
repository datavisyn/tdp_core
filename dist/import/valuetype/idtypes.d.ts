import { ITypeDefinition, IValueTypeEditor, ValueTypeEditor } from './valuetypes';
export interface IIDTypeDetector {
    detectIDType: (data: any[], accessor: (row: any) => string, sampleSize: number, options?: {
        [property: string]: any;
    }) => Promise<number> | number;
}
interface IPluginResult {
    idType: string;
    confidence: number;
}
export declare class IDTypeUtils {
    static editIDType(definition: ITypeDefinition): Promise<ITypeDefinition>;
    static guessIDType(def: ITypeDefinition, data: any[], accessor: (row: any) => string): Promise<ITypeDefinition>;
    static isIDType(name: string, index: number, data: any[], accessor: (row: any) => string, sampleSize: number): Promise<number>;
    static executePlugins(data: any[], accessor: (row: any) => string, sampleSize: number): Promise<IPluginResult[]>;
    static parseIDType(def: ITypeDefinition, data: any[], accessor: (row: any, value?: any) => string): any[];
    static getMarkup(this: ValueTypeEditor, current: ValueTypeEditor, def: ITypeDefinition): Promise<string>;
    static idType(): IValueTypeEditor;
}
export {};
//# sourceMappingURL=idtypes.d.ts.map