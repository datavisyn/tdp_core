import * as React from 'react';
import { Scales, VisColumn, IVisConfig, IBarConfig } from '../interfaces';
export declare function BarVis({ config, optionsConfig, extensions, columns, setConfig, scales, selectionCallback, selectedMap, selectedList, enableSidebar, showSidebar, setShowSidebar, showCloseButton, closeButtonCallback, }: {
    config: IBarConfig;
    optionsConfig?: {
        group?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
        multiples?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
        direction?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
        groupingType?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
        display?: {
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
    closeButtonCallback?: () => void;
    showCloseButton?: boolean;
    selectionCallback?: (ids: string[]) => void;
    selectedMap?: {
        [key: string]: boolean;
    };
    selectedList: string[];
    setConfig: (config: IVisConfig) => void;
    scales: Scales;
    showSidebar?: boolean;
    setShowSidebar?(show: boolean): void;
    enableSidebar?: boolean;
}): JSX.Element;
//# sourceMappingURL=BarVis.d.ts.map