import * as React from 'react';
import { CategoricalColumn, IStripConfig, IVisConfig, NumericalColumn, Scales } from '..';
interface StripVisProps {
    config: IStripConfig;
    optionsConfig?: {};
    extensions?: {
        prePlot?: React.ReactNode;
        postPlot?: React.ReactNode;
        preSidebar?: React.ReactNode;
        postSidebar?: React.ReactNode;
    };
    columns: (NumericalColumn | CategoricalColumn)[];
    setConfig: (config: IVisConfig) => void;
    scales: Scales;
    hideSidebar?: boolean;
}
export declare function StripVis({ config, optionsConfig, extensions, columns, setConfig, scales, hideSidebar, }: StripVisProps): JSX.Element;
export {};
//# sourceMappingURL=StripVis.d.ts.map