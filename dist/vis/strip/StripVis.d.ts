import * as React from 'react';
import { VisCategoricalColumn, VisNumericalColumn, Scales } from '../interfaces';
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
    columns: (VisNumericalColumn | VisCategoricalColumn)[];
    setConfig: (config: IVisConfig) => void;
    scales: Scales;
}
export declare function StripVis({ config, optionsConfig, extensions, columns, setConfig, scales }: StripVisProps): JSX.Element;
export {};
