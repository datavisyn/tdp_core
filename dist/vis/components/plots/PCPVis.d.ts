import * as React from 'react';
import { CategoricalColumn, NumericalColumn } from '../../types/generalTypes';
import { IVisConfig } from '../../types/generalTypes';
import { IPCPConfig } from '../../plotUtils/pcp';
interface PCPVisProps {
    config: IPCPConfig;
    optionsConfig?: {};
    extensions?: {
        prePlot?: React.ReactNode;
        postPlot?: React.ReactNode;
        preSidebar?: React.ReactNode;
        postSidebar?: React.ReactNode;
    };
    columns: (NumericalColumn | CategoricalColumn)[];
    setConfig: (config: IVisConfig) => void;
}
export declare function PCPVis({ config, optionsConfig, extensions, columns, setConfig, }: PCPVisProps): JSX.Element;
export {};
