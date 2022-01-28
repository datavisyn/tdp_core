export interface IXLSXColumn {
    name: string;
    type: 'string' | 'float' | 'int' | 'date' | 'boolean';
}
export interface IXLSXSheet {
    title: string;
    columns: IXLSXColumn[];
    rows: {
        [key: string]: string | number | Date | boolean | null;
    }[];
}
export interface IXLSXJSONFile {
    sheets: IXLSXSheet[];
}
export declare class XlsxUtils {
    static xlsx2json(file: File): Promise<IXLSXJSONFile>;
    static xlsx2jsonArray(file: File): Promise<any[][]>;
    static json2xlsx(file: IXLSXJSONFile): Promise<Blob>;
    static jsonArray2xlsx(file: any[][]): Promise<Blob>;
}
//# sourceMappingURL=XlsxUtils.d.ts.map