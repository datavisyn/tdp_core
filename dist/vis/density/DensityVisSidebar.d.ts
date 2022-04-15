import * as React from 'react';
import { IDensityConfig, IVisConfig, VisColumn } from '../interfaces';
interface DensityVisSidebarProps {
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
    width?: string;
}
export declare function DensityVisSidebar({ config, extensions, columns, setConfig, selectionCallback, selected, width, }: DensityVisSidebarProps): JSX.Element;
export {};
//# sourceMappingURL=DensityVisSidebar.d.ts.map