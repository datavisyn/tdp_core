import * as React from 'react';
import { IVisConfig, VisColumn, IStripConfig, Scales } from '../interfaces';
interface StripVisProps {
    config: IStripConfig;
    extensions?: {
        prePlot?: React.ReactNode;
        postPlot?: React.ReactNode;
        preSidebar?: React.ReactNode;
        postSidebar?: React.ReactNode;
    };
    columns: VisColumn[];
    setConfig: (config: IVisConfig) => void;
    scales: Scales;
    hideSidebar?: boolean;
}
export declare function StripVis({ config, extensions, columns, setConfig, scales, hideSidebar }: StripVisProps): JSX.Element;
export {};
//# sourceMappingURL=StripVis.d.ts.map