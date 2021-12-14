import { CategoricalColumn, IPCPConfig, NumericalColumn, Scales } from '../types/generalTypes';
import { PlotlyInfo } from '../types/generalTypes';
export declare function createPCPTraces(columns: (NumericalColumn | CategoricalColumn)[], selected: {
    [key: number]: boolean;
}, config: IPCPConfig, scales: Scales): PlotlyInfo;
