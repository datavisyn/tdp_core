import * as React from 'react';
import { CategoricalColumn, NumericalColumn, Scales } from '../../types/generalTypes';
import { IVisConfig } from '../../types/generalTypes';
import { IViolinConfig } from '../../plotUtils/violin';
interface ViolinVisProps {
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
    columns: (NumericalColumn | CategoricalColumn)[];
    setConfig: (config: IVisConfig) => void;
    scales: Scales;
}
export declare function ViolinVis({ config, optionsConfig, extensions, columns, setConfig, scales }: ViolinVisProps): JSX.Element;
export {};
