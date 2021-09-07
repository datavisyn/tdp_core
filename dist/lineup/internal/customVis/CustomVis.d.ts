/// <reference types="react" />
export declare type supportedPlotlyVis = 'Chooser' | 'Scatter' | 'Parallel Coordinates' | 'Violin' | 'Strip' | 'Multiples';
export interface CustomVisProps {
    columns: (NumericalColumn | CategoricalColumn)[];
    type: supportedPlotlyVis;
    selectionCallback: (s: string[]) => void;
    filterCallback: (s: string) => void;
}
export interface NumericalColumn {
    name: string;
    vals: {
        id: string;
        val: number;
        selected: boolean;
    }[];
    type: 'number';
    selectedForMultiples: boolean;
}
export interface CategoricalColumn {
    name: string;
    vals: {
        id: string;
        val: string;
        selected: boolean;
    }[];
    type: 'categorical';
    selectedForMultiples: boolean;
}
export declare const chartTypes: supportedPlotlyVis[];
export declare const correlationTypes: supportedPlotlyVis[];
export declare const distributionTypes: supportedPlotlyVis[];
export declare const highDimensionalTypes: supportedPlotlyVis[];
export declare function CustomVis(props: CustomVisProps): JSX.Element;
