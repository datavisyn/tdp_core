/// <reference types="react" />
import { CategoricalColumn, NumericalColumn, supportedPlotlyVis } from './CustomVis';
import { MultipleDataTraces, MultiplesProps } from './Multiples';
interface ViolinProps {
    xCol: NumericalColumn | CategoricalColumn;
    yCol: NumericalColumn | CategoricalColumn;
    columns: (NumericalColumn | CategoricalColumn)[];
    type: supportedPlotlyVis;
    updateXAxis: (s: string) => void;
    updateYAxis: (s: string) => void;
    updateChartType: (s: string) => void;
}
export declare function createMultiplesViolinData(props: MultiplesProps, selectedNumCols: string[], selectedCatCols: string[], colorScale: any): MultipleDataTraces;
export declare function Violin(props: ViolinProps): JSX.Element;
export {};
