import { CategoricalColumn, IStripConfig, NumericalColumn, Scales } from '../types/generalTypes';
import { PlotlyInfo } from '../types/generalTypes';
export declare function createStripTraces(columns: (NumericalColumn | CategoricalColumn)[], config: IStripConfig, scales: Scales): PlotlyInfo;
