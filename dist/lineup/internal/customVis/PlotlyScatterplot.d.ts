/// <reference types="react" />
import { CategoricalColumn, NumericalColumn, supportedPlotlyVis } from './CustomVis';
import { MultipleDataTraces, MultiplesProps } from './Multiples';
interface ScatterplotProps {
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
export declare function createMultiplesScatterplotData(props: MultiplesProps, selectedNumCols: string[], shapeScale: any, colorScale: any, opacityScale: any, bubbleScale: any): MultipleDataTraces;
export declare function Scatterplot(props: ScatterplotProps): JSX.Element;
export {};
