import * as React from 'react';
import { CategoricalColumn, IVisConfig, IStripConfig, NumericalColumn, Scales } from '../interfaces';
interface StripVisProps {
    config: IStripConfig;
    optionsConfig?: unknown;
    extensions?: {
        prePlot?: React.ReactNode;
        postPlot?: React.ReactNode;
        preSidebar?: React.ReactNode;
        postSidebar?: React.ReactNode;
    };
    columns: (NumericalColumn | CategoricalColumn)[];
    setConfig: (config: IVisConfig) => void;
    scales: Scales;
}
export declare function StripVis({ config, optionsConfig, extensions, columns, setConfig, scales }: StripVisProps): JSX.Element;
export {};
//# sourceMappingURL=StripVis.d.ts.map