/// <reference types="react" />
export declare type supportedPlotlyVis = "Chooser" | "Scatterplot" | "PCP" | "Violin" | "Strip Plot" | "Multiples";
export interface CustomVisProps {
    columns: (NumericalColumn | CategoricalColumn)[];
    type: supportedPlotlyVis;
}
export interface NumericalColumn {
    name: string;
    vals: number[];
    type: "Numerical";
    selectedForMultiples: boolean;
}
export interface CategoricalColumn {
    name: string;
    vals: string[];
    type: "Categorical";
    selectedForMultiples: boolean;
}
export declare const chartTypes: supportedPlotlyVis[];
export declare const correlationTypes: supportedPlotlyVis[];
export declare const distributionTypes: supportedPlotlyVis[];
export declare const highDimensionalTypes: supportedPlotlyVis[];
export declare function CustomVis(props: CustomVisProps): JSX.Element;
