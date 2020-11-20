import { IDataRow, Column, LocalDataProvider } from 'lineupjs';
export declare type ExportType = 'json' | 'csv' | 'tsv' | 'ssv' | 'xlsx';
export declare class ExportUtils {
    private static getColumnName;
    static exportRanking(columns: Column[], rows: IDataRow[], separator: string): string;
    static exportJSON(columns: Column[], rows: IDataRow[]): string;
    static exportxlsx(columns: Column[], rows: IDataRow[]): Promise<Blob>;
    static exportLogic(type: 'custom' | ExportType, onlySelected: boolean, provider: LocalDataProvider): Promise<{
        content: Blob;
        mimeType: string;
        name: string;
    }>;
    private static toBlob;
    private static convertRanking;
    private static customizeDialog;
    static resortAble(base: HTMLElement, elementSelector: string): void;
}
