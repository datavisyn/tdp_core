import { IDataRow, Column, LocalDataProvider } from 'lineupjs';
export declare type ExportFormat = 'json' | 'csv' | 'tsv' | 'ssv' | 'xlsx';
export declare type ExportRows = 'all' | 'filtered' | 'selected';
/**
 * Store the ordered row indices
 */
export interface IOrderedRowIndices {
    /**
     * All row indices from the data provider.
     * Indices are not sorting (= sorting of input data)!
     */
    all: number[];
    /**
     * Indices of the selected rows.
     * Indices are sorted by the *first* ranking.
     */
    selected: number[];
    /**
     * Indices of the filtered rows.
     * Indices are sorted and filtered by the *first* ranking.
     */
    filtered: number[];
}
export declare class ExportUtils {
    private static getColumnName;
    static exportRanking(columns: Column[], rows: IDataRow[], separator: string): string;
    static exportJSON(columns: Column[], rows: IDataRow[]): string;
    static exportxlsx(columns: Column[], rows: IDataRow[]): Promise<Blob>;
    static exportLogic(format: 'custom' | ExportFormat, rows: 'custom' | ExportRows, orderedRowIndices: IOrderedRowIndices, provider: LocalDataProvider): Promise<{
        content: Blob;
        mimeType: string;
        name: string;
    }>;
    private static toBlob;
    private static convertRanking;
    private static customizeDialog;
    static resortAble(base: HTMLElement, elementSelector: string): void;
}
