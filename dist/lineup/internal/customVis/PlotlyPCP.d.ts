/// <reference types="react" />
import { CategoricalColumn, NumericalColumn, supportedPlotlyVis } from './CustomVis';
import { MultipleDataTraces, MultiplesProps } from './Multiples';
interface PCPProps {
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
export declare function createPCPData(props: MultiplesProps, selectedNumCols: string[], selectedCatCols: string[], colorScale: any): MultipleDataTraces;
export declare function PCP(props: PCPProps): JSX.Element;
export {};
