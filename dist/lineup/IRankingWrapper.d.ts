import { Column } from 'lineupjs';
export interface IRankingWrapper {
    sortBy(column: string, asc?: boolean): boolean;
    groupBy(column: string, aggregate?: boolean): boolean;
    findColumn<T extends Column>(column: string): T | null;
}
//# sourceMappingURL=IRankingWrapper.d.ts.map