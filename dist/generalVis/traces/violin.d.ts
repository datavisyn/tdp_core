import { CategoricalColumn, IViolinConfig, NumericalColumn, Scales } from '../types/generalTypes';
import { PlotlyInfo } from '../types/generalTypes';
export declare function createViolinTraces(columns: (NumericalColumn | CategoricalColumn)[], config: IViolinConfig, scales: Scales): PlotlyInfo;
