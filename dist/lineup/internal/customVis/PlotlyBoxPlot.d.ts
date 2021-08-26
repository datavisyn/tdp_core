/// <reference types="react" />
import { CategoricalColumn, NumericalColumn } from './CustomVis';
export declare type supportedPlotlyVis = "Chooser" | "Scatterplot" | "Bar Chart";
interface ScatterplotProps {
    xCol: NumericalColumn | CategoricalColumn;
    yCol: NumericalColumn | CategoricalColumn;
    columns: (NumericalColumn | CategoricalColumn)[];
    bubbleSize: NumericalColumn | null;
    opacity: NumericalColumn | null;
    color: CategoricalColumn | null;
    shape: CategoricalColumn | null;
    updateXAxis: (s: string) => void;
    updateYAxis: (s: string) => void;
    updateBubbleSize: (s: string) => void;
    updateOpacity: (s: string) => void;
    updateColor: (s: string) => void;
    updateShape: (s: string) => void;
    updateChartType: (s: string) => void;
}
export declare function Scatterplot(props: ScatterplotProps): JSX.Element;
export {};
