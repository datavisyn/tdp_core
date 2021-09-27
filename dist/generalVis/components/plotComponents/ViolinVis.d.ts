/// <reference types="react" />
import { CategoricalColumn, IViolinConfig, NumericalColumn, Scales } from '../../types/generalTypes';
import { IVisConfig } from '../../types/generalTypes';
interface ViolinVisProps {
    config: IViolinConfig;
    optionsConfig?: {
        overlay?: {
            enable?: boolean;
        };
    };
    columns: (NumericalColumn | CategoricalColumn)[];
    setConfig: (config: IVisConfig) => void;
    scales: Scales;
}
export declare function ViolinVis(props: ViolinVisProps): JSX.Element;
export {};
