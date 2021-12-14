import { CategoricalColumn } from 'lineupjs';
import { PlotlyInfo, ColumnInfo, IVisConfig, NumericalColumn } from './generalTypes';
export interface GeneralPlot {
    createTraces(columns: (NumericalColumn | CategoricalColumn)[], config: IVisConfig, selectedCatCols: ColumnInfo[], selectedNumCols: ColumnInfo[]): PlotlyInfo;
}
