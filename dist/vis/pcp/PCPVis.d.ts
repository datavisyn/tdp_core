import * as React from 'react';
import { VisColumn, IVisConfig } from '../interfaces';
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
    columns: VisColumn[];
    setConfig: (config: IVisConfig) => void;
}
export declare function PCPVis({ config, optionsConfig, extensions, columns, setConfig, }: PCPVisProps): JSX.Element;
export {};
