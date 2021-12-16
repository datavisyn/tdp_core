import * as React from 'react';
import { VisCategoricalColumn, VisNumericalColumn } from '../interfaces';
import { IVisConfig } from '../interfaces';
import { IPCPConfig } from './utils';
interface PCPVisProps {
    config: IPCPConfig;
    optionsConfig?: {};
    extensions?: {
        prePlot?: React.ReactNode;
        postPlot?: React.ReactNode;
        preSidebar?: React.ReactNode;
        postSidebar?: React.ReactNode;
    };
    columns: (VisNumericalColumn | VisCategoricalColumn)[];
    setConfig: (config: IVisConfig) => void;
}
export declare function PCPVis({ config, optionsConfig, extensions, columns, setConfig, }: PCPVisProps): JSX.Element;
export {};
