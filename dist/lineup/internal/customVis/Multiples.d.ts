/// <reference types="react" />
import { Data } from 'plotly.js';
import { CategoricalColumn, NumericalColumn, supportedPlotlyVis } from './CustomVis';
export interface MultiplesProps {
    xCol: NumericalColumn | CategoricalColumn;
    yCol: NumericalColumn | CategoricalColumn;
    columns: (NumericalColumn | CategoricalColumn)[];
    bubbleSize: NumericalColumn | null;
    opacity: NumericalColumn | null;
    color: CategoricalColumn | null;
    shape: CategoricalColumn | null;
    type: supportedPlotlyVis;
    updateXAxis: (s: string) => void;
    updateYAxis: (s: string) => void;
    updateBubbleSize: (s: string) => void;
    updateOpacity: (s: string) => void;
    updateColor: (s: string) => void;
    updateShape: (s: string) => void;
    updateChartType: (s: string) => void;
    selectedCallback: (s: string[]) => void;
}
export declare type MultipleDataTraces = {
    plots: MultiplesPlot[];
    legendPlots: MultiplesPlot[];
    rows: number;
    cols: number;
    errorMessage: string;
};
export declare type MultiplesPlot = {
    data: Data;
    xLabel: string;
    yLabel: string;
};
export declare function Multiples(props: MultiplesProps): JSX.Element;
