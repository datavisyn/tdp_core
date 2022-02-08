import * as React from 'react';
import { Scales, VisColumn, IVisConfig, IViolinConfig } from '../interfaces';
interface ViolinVisProps {
    config: IViolinConfig;
    optionsConfig?: {
        overlay?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
    };
    extensions?: {
        prePlot?: React.ReactNode;
        postPlot?: React.ReactNode;
        preSidebar?: React.ReactNode;
        postSidebar?: React.ReactNode;
    };
    columns: VisColumn[];
    setConfig: (config: IVisConfig) => void;
    scales: Scales;
}
export declare function ViolinVis({ config, optionsConfig, extensions, columns, setConfig, scales }: ViolinVisProps): JSX.Element;
export {};
//# sourceMappingURL=ViolinVis.d.ts.map