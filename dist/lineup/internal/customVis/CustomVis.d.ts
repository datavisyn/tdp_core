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
}
export interface CategoricalColumn {
    name: string;
    vals: string[];
    type: "Categorical";
}
export declare function CustomVis(props: CustomVisProps): JSX.Element;
