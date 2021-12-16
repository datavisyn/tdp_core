/// <reference types="react" />
import { ColumnInfo, VisNumericalColumn, VisCategoricalColumn } from '../interfaces';
export declare const formatOptionLabel: (option: any, ctx: any) => JSX.Element;
export declare function getCol(columns: (VisNumericalColumn | VisCategoricalColumn)[], info: ColumnInfo | null): VisNumericalColumn | VisCategoricalColumn | null;
