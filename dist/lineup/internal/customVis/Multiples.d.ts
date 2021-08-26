/// <reference types="react" />
import { CategoricalColumn, NumericalColumn, supportedPlotlyVis } from './CustomVis';
interface MultiplesProps {
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
}
export declare function Multiples(props: MultiplesProps): JSX.Element;
export {};
