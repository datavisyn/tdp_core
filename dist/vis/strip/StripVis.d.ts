import * as React from 'react';
import { CategoricalColumn, NumericalColumn, Scales } from '../interfaces';
import { IVisConfig } from '../interfaces';
import { IStripConfig } from './utils';
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