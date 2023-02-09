import * as React from 'react';
import { Scales, VisColumn, IVisConfig, IViolinConfig } from '../interfaces';
export declare function ViolinVis({ config, optionsConfig, extensions, columns, setConfig, scales, showSidebar, setShowSidebar, enableSidebar, showCloseButton, closeButtonCallback, }: {
    config: IViolinConfig;
    optionsConfig?: {
        overlay?: {
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
    setConfig: (config: IVisConfig) => void;
    closeButtonCallback?: () => void;
    scales: Scales;
    showSidebar?: boolean;
    setShowSidebar?(show: boolean): void;
    enableSidebar?: boolean;
    showCloseButton?: boolean;
}): JSX.Element;
//# sourceMappingURL=ViolinVis.d.ts.map