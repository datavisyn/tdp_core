import { IRow } from '../base/rest';
import { ISelection, IViewContext } from '../base/interfaces';
import { AView } from './AView';
export interface ISortItem<T> {
    node: HTMLElement;
    row: T;
    index: number;
}
export interface ISorter<T> {
    (a: ISortItem<T>, b: ISortItem<T>): number;
}
export interface IATableViewOptions<T> {
    selectAble: boolean;
    stripedRows: boolean;
    bordered: boolean;
    condensed: boolean;
    sortable: boolean | ((th: HTMLElement, index: number) => boolean | 'number' | 'string' | ISorter<T>);
    exportable?: boolean;
    exportSeparator?: ',' | ';' | 'xlsx';
}
/**
 * base class for views based on LineUp
 */
export declare abstract class ATableView<T extends IRow> extends AView {
    private readonly options;
    /**
     * clears and rebuilds this lineup instance from scratch
     * @returns {Promise<any[]>} promise when done
     */
    protected rebuild: (...args: any[]) => void;
    /**
     * similar to rebuild but just loads new data and keep the columns
     * @returns {Promise<any[]>} promise when done
     */
    protected reloadData: (...args: any[]) => void;
    /**
     * promise resolved when everything is built
     * @type {any}
     */
    protected built: Promise<any>;
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options?: Partial<IATableViewOptions<T>>);
    /**
     * custom initialization function at the build will be called
     */
    protected initImpl(): Promise<void>;
    protected renderHeader(tr: HTMLTableRowElement, rows: T[]): (keyof T)[];
    protected renderRow(tr: HTMLTableRowElement, row: T, index: number, keys: (keyof T)[]): void;
    /**
     * load the rows of LineUp
     * @returns {Promise<IRow[]>} the rows at least containing the represented ids
     */
    protected abstract loadRows(): Promise<T[]> | T[];
    protected buildHook(): void;
    private build;
    protected renderHook(rows: T[]): void;
    private renderTable;
    private reloadDataImpl;
    private rebuildImpl;
    /**
     * Add icon to export HTML Table content to the most right column in the table header.
     */
    private enableExport;
    static enableSort<T>(this: void, header: HTMLElement, body: HTMLElement, sortable: boolean | ((th: HTMLElement, index: number) => boolean | 'number' | 'string' | ISorter<T>)): void;
    /**
     * Download the HTML Table content.
     */
    static exportHtmlTableContent(document: Document, tableRoot: HTMLElement, separator: string, name: string): void;
    private static download;
    /**
     * Parse HTML Table header and body content.
     * @returns {string} The table content in csv format
     */
    private static extractFromHTML;
    /**
     * Parse HTML Table header and body content.
     * @returns {string} The table content in csv format
     */
    private static parseHtmlTableContent;
}
//# sourceMappingURL=ATableView.d.ts.map