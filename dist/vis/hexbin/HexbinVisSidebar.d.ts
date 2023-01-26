import * as React from 'react';
import { IHexbinConfig, IVisConfig, VisColumn } from '../interfaces';
interface DensityVisSidebarProps {
    config: IHexbinConfig;
    extensions?: {
        prePlot?: React.ReactNode;
        postPlot?: React.ReactNode;
        preSidebar?: React.ReactNode;
        postSidebar?: React.ReactNode;
    };
    columns: VisColumn[];
    setConfig: (config: IVisConfig) => void;
}
export declare function HexbinVisSidebar({ config, extensions, columns, setConfig }: DensityVisSidebarProps): JSX.Element;
export {};
//# sourceMappingURL=HexbinVisSidebar.d.ts.map