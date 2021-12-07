/// <reference types="react" />
import { Column } from 'react-table';
export interface ITableProps<T extends object> {
    columns: Column<T>[];
    data: T[];
}
export declare function TDP_UI_Table<T extends object>(props: ITableProps<T>): JSX.Element;
