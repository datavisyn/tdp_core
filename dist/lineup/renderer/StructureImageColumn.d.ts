import { StringColumn, IDataRow, IStringFilter } from 'lineupjs';
export interface IStructureFilter extends IStringFilter {
    filter: string;
    valid: Set<string>;
}
export declare class StructureImageColumn extends StringColumn {
    protected structureFilter: IStructureFilter | null;
    protected align: string | null;
    filter(row: IDataRow): boolean;
    isFiltered(): boolean;
    getFilter(): IStructureFilter;
    setFilter(filter: IStructureFilter | null): void;
    getAlign(): string | null;
    setAlign(structure: string | null): void;
}
//# sourceMappingURL=StructureImageColumn.d.ts.map