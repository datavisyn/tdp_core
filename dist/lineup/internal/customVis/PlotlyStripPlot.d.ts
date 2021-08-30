/// <reference types="react" />
import { CategoricalColumn, NumericalColumn, supportedPlotlyVis } from './CustomVis';
import { MultipleDataTraces, MultiplesProps } from './Multiples';
interface StripChartProps {
    xCol: NumericalColumn | CategoricalColumn;
    yCol: NumericalColumn | CategoricalColumn;
    columns: (NumericalColumn | CategoricalColumn)[];
    type: supportedPlotlyVis;
    updateXAxis: (s: string) => void;
    updateYAxis: (s: string) => void;
    updateChartType: (s: string) => void;
}
export declare function createMultiplesStripData(props: MultiplesProps, selectedNumCols: string[], selectedCatCols: string[], colorScale: any): MultipleDataTraces;
export declare function StripChart(props: StripChartProps): JSX.Element;
export {};
