import * as React from 'react';
import { VisColumn, IVisConfig, IHexbinConfig } from '../interfaces';
interface DensityVisProps {
    config: IHexbinConfig;
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
export declare function HexbinVis({ config, extensions, columns, setConfig, selectionCallback, selected, hideSidebar }: DensityVisProps): JSX.Element;
export {};
//# sourceMappingURL=HexbinVis.d.ts.map