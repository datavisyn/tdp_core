import * as React from 'react';
import { Scatterplot } from './PlotlyScatterplot';
export declare type supportedPlotlyVis = "Chooser" | "Scatterplot" | "Bar Chart";
export declare type supportedComponents = Scatterplot;
export interface CustomVisProps {
    xVals: number[];
    yVals: number[];
    type: supportedPlotlyVis;
}
interface CustomVisState {
    xVals: number[];
    yVals: number[];
    type: supportedPlotlyVis;
}
export declare class CustomVis extends React.Component<CustomVisProps, CustomVisState> {
    constructor(props: CustomVisProps);
    render(): Scatterplot;
}
export {};
