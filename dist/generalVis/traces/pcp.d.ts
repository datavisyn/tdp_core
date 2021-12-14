import { CategoricalColumn, IPCPConfig, NumericalColumn } from '../types/generalTypes';
import { PlotlyInfo } from '../types/generalTypes';
export declare function createPCPTraces(columns: (NumericalColumn | CategoricalColumn)[], config: IPCPConfig): PlotlyInfo;
