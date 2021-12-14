import * as React from 'react';
import { CategoricalColumn, EFilterOptions, IScatterConfig, NumericalColumn, Scales } from '../../types/generalTypes';
import { IVisConfig } from '../../types/generalTypes';
interface ScatterVisProps {
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
    columns: (NumericalColumn | CategoricalColumn)[];
    filterCallback: (s: EFilterOptions) => void;
    selectionCallback: (s: number[]) => void;
    selected: {
        [key: number]: boolean;
    };
    setConfig: (config: IVisConfig) => void;
    scales: Scales;
}
export declare function ScatterVis({ config, optionsConfig, columns, filterCallback, selectionCallback, selected, setConfig, scales }: ScatterVisProps): JSX.Element;
export {};
