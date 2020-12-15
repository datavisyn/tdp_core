import { IDataRow, Column } from 'lineupjs';
export declare class ExportUtils {
    private static getColumnName;
    static exportRanking(columns: Column[], rows: IDataRow[], separator: string): string;
    static exportJSON(columns: Column[], rows: IDataRow[]): string;
    static exportXLSX(columns: Column[], rows: IDataRow[]): Promise<Blob>;
    static resortAble(base: HTMLElement, elementSelector: string): void;
}
