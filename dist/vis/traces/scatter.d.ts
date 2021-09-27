import { NumericalColumn, CategoricalColumn, IScatterConfig, Scales } from '../types/generalTypes';
import { PlotlyInfo } from '../types/generalTypes';
export declare enum ENumericalColorScaleType {
    SEQUENTIAL = "Sequential",
    DIVERGENT = "Divergent"
}
export declare function createScatterTraces(columns: (NumericalColumn | CategoricalColumn)[], selected: {
    [key: number]: boolean;
}, config: IScatterConfig, scales: Scales): PlotlyInfo;
