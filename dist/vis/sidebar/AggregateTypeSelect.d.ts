/// <reference types="react" />
import { ColumnInfo, EAggregateTypes, VisColumn } from '../interfaces';
interface AggregateTypeSelectProps {
    aggregateTypeSelectCallback: (s: EAggregateTypes) => void;
    aggregateColumn: ColumnInfo | null;
    aggregateColumnSelectCallback: (c: ColumnInfo) => void;
    columns: VisColumn[];
    currentSelected: EAggregateTypes;
}
export declare function AggregateTypeSelect({ aggregateTypeSelectCallback, aggregateColumnSelectCallback, columns, currentSelected, aggregateColumn, }: AggregateTypeSelectProps): JSX.Element;
export {};
//# sourceMappingURL=AggregateTypeSelect.d.ts.map