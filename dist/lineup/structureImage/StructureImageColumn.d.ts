import { StringColumn, IDataRow, IStringColumnDesc } from 'lineupjs';
export interface IStructureImageFilter {
    /**
     * Search string which is used to filter the column data
     */
    filter: string;
    /**
     * Filter out rows with missing values
     */
    filterMissing: boolean;
    /**
     * The set contains matching results that should be visible
     */
    matching: Set<string>;
}
export declare class StructureImageColumn extends StringColumn {
    protected structureFilter: IStructureImageFilter | null;
    protected align: string | null;
    constructor(id: string, desc: Readonly<IStringColumnDesc>);
    filter(row: IDataRow): boolean;
    isFiltered(): boolean;
    getFilter(): IStructureImageFilter;
    setFilter(filter: IStructureImageFilter | null): void;
    getAlign(): string | null;
    setAlign(structure: string | null): void;
}
//# sourceMappingURL=StructureImageColumn.d.ts.map