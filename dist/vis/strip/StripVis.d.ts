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
    selectionCallback?: (s: string[]) => void;
    closeButtonCallback?: () => void;
    selected?: {
        [key: string]: boolean;
    };
    hideSidebar?: boolean;
    showCloseButton?: boolean;
}
export declare function StripVis({ config, extensions, columns, setConfig, selectionCallback, selected, scales, hideSidebar, showCloseButton, closeButtonCallback, }: StripVisProps): JSX.Element;
export {};
//# sourceMappingURL=StripVis.d.ts.map