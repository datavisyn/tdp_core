import * as React from 'react';
import { VisColumn, IVisConfig, IDensityConfig } from '../interfaces';
interface DensityVisProps {
    config: IDensityConfig;
    extensions?: {
        prePlot?: React.ReactNode;
        postPlot?: React.ReactNode;
        preSidebar?: React.ReactNode;
        postSidebar?: React.ReactNode;
    };
    columns: VisColumn[];
    setConfig: (config: IVisConfig) => void;
    selectionCallback?: (ids: string[]) => void;
    selected?: {
        [key: string]: boolean;
    };
    hideSidebar?: boolean;
}
export declare function DensityVis({ config, extensions, columns, setConfig, selectionCallback, selected, hideSidebar }: DensityVisProps): JSX.Element;
export {};
//# sourceMappingURL=DensityVis.d.ts.map