import * as React from 'react';
import { Scales, VisColumn, IVisConfig, IBarConfig } from '../interfaces';
interface BarVisProps {
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
    hideSidebar?: boolean;
}
export declare function BarVis({ config, optionsConfig, extensions, columns, setConfig, scales, selectionCallback, selectedMap, selectedList, hideSidebar, showCloseButton, closeButtonCallback, }: BarVisProps): JSX.Element;
export {};
//# sourceMappingURL=BarVis.d.ts.map