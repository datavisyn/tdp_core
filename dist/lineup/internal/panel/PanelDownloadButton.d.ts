import { Column, IDataRow, LocalDataProvider } from 'lineupjs';
import { IPanelButton } from './PanelButton';
export interface IExportFormat {
    name: string;
    separator: string;
    mimeType: string;
    fileExtension: string;
    getRankingContent(columns: Column[], rows: IDataRow[]): string;
}
export declare const ExportFormat: {
    JSON: IExportFormat;
    CSV: IExportFormat;
    TSV: IExportFormat;
    SSV: IExportFormat;
    XLSX: IExportFormat;
};
/**
 * A button dropdown to download selected/all rows of the ranking
 */
export declare class PanelDownloadButton implements IPanelButton {
    private provider;
    readonly node: HTMLElement;
    private orderedRowIndices;
    constructor(parent: HTMLElement, provider: LocalDataProvider, isTopMode: boolean);
    private updateNumRowsAttributes;
    /**
     * Add event listener to LineUp data provider and
     * update the number of rows in the dataset attributes for different row types.
     */
    private addLineUpEventListner;
    private convertRanking;
    private customizeDialog;
    private downloadFile;
}
