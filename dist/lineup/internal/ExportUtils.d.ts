import { IDataRow, Column } from 'lineupjs';
export interface IExportFormat {
    name: string;
    separator: string;
    mimeType: string;
    fileExtension: string;
    getRankingContent(columns: Column[], rows: IDataRow[]): Promise<Blob>;
}
export declare class ExportUtils {
    private static EXPORT_FORMAT;
    /**
     * Returns an IExportFormat object for the given format.
     * If no format is registered the return value is `null`.
     *
     * @param format Export format as string
     */
    static getExportFormat(format: string): IExportFormat;
    private static getColumnName;
    private static exportRanking;
    private static exportJSON;
    private static exportXLSX;
    private static toBlob;
}
//# sourceMappingURL=ExportUtils.d.ts.map