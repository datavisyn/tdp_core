import * as React from 'react';
import { CategoricalColumn, NumericalColumn, Scales } from '../../types/generalTypes';
import { IVisConfig } from '../../types/generalTypes';
import { IStripConfig } from '../../plotUtils/strip';
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
}
export declare function StripVis({ config, optionsConfig, extensions, columns, setConfig, scales }: StripVisProps): JSX.Element;
export {};
