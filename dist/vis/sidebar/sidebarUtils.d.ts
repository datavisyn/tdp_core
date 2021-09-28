/// <reference types="react" />
import { ColumnInfo, NumericalColumn, CategoricalColumn } from '../interfaces';
export declare const formatOptionLabel: (option: any, ctx: any) => JSX.Element;
export declare function getCol(columns: (NumericalColumn | CategoricalColumn)[], info: ColumnInfo | null): NumericalColumn | CategoricalColumn | null;
