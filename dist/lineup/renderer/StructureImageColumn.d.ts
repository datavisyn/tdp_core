import { StringColumn, IDataRow } from 'lineupjs';
export interface IStructureImageFilter {
    filter: string;
    filterMissing: boolean;
    valid: Set<string>;
}
export declare class StructureImageColumn extends StringColumn {
    protected structureFilter: IStructureImageFilter | null;
    protected align: string | null;
    filter(row: IDataRow): boolean;
    isFiltered(): boolean;
    getFilter(): IStructureImageFilter;
    setFilter(filter: IStructureImageFilter | null): void;
    getAlign(): string | null;
    setAlign(structure: string | null): void;
}
//# sourceMappingURL=StructureImageColumn.d.ts.map