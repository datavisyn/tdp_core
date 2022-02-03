import * as React from 'react';
import { CategoricalColumn, NumericalColumn } from '../interfaces';
import { IVisConfig } from '../interfaces';
import { IBarConfig } from './utils';
interface BarVisSidebarProps {
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
    columns: (NumericalColumn | CategoricalColumn)[];
    setConfig: (config: IVisConfig) => void;
    width?: string;
}
export declare function BarVisSidebar({ config, optionsConfig, extensions, columns, setConfig, width }: BarVisSidebarProps): JSX.Element;
export {};
//# sourceMappingURL=BarVisSidebar.d.ts.map