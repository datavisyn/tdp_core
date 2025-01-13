import { BooleanColumn, IBooleanColumnDesc, IDataRow } from 'lineupjs';
/**
 * extra column for highlighting and filtering
 */
export declare class OverviewColumn extends BooleanColumn {
    static readonly GROUP_TRUE: {
        name: string;
        color: string;
    };
    static readonly GROUP_FALSE: {
        name: string;
        color: string;
    };
    private overviewSelection;
    private currentOverview;
    constructor(id: string, desc: IBooleanColumnDesc);
    getValue(row: IDataRow): boolean;
    setOverview(rows?: any[], name?: string): void;
    getOverview(): {
        name: string;
        rows: any[];
    };
    get categoryLabels(): string[];
    get categoryColors(): string[];
    group(row: IDataRow): {
        name: string;
        color: string;
    };
}
//# sourceMappingURL=OverviewColumn.d.ts.map