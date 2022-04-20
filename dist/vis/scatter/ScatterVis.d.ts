import * as React from 'react';
import { EFilterOptions, IVisConfig, Scales, IScatterConfig, VisColumn } from '../interfaces';
export declare function ScatterVis({ config, optionsConfig, extensions, columns, shapes, filterCallback, selectionCallback, selectedMap, selectedList, setConfig, hideSidebar, showCloseButton, closeButtonCallback, scales, }: {
    config: IScatterConfig;
    optionsConfig?: {
        color?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
        shape?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
        filter?: {
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
    shapes?: string[];
    columns: VisColumn[];
    filterCallback?: (s: EFilterOptions) => void;
    selectionCallback?: (ids: string[]) => void;
    closeButtonCallback?: () => void;
    selectedMap?: {
        [key: string]: boolean;
    };
    selectedList: string[];
    setConfig: (config: IVisConfig) => void;
    scales: Scales;
    hideSidebar?: boolean;
    showCloseButton?: boolean;
}): JSX.Element;
//# sourceMappingURL=ScatterVis.d.ts.map