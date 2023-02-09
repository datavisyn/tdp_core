import * as React from 'react';
import { VisColumn, IVisConfig, IHexbinConfig } from '../interfaces';
export declare function HexbinVis({ config, extensions, columns, setConfig, selectionCallback, selected, enableSidebar, setShowSidebar, showSidebar, }: {
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
    showSidebar?: boolean;
    setShowSidebar?(show: boolean): void;
    enableSidebar?: boolean;
}): JSX.Element;
//# sourceMappingURL=HexbinVis.d.ts.map