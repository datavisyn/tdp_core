import { GeneralPlot } from './GeneralPlot';
import { MultipleDataTraces, MultiplesProps } from './Multiples';
export declare class PlotlyStrip extends GeneralPlot {
    startingHeuristic(props: MultiplesProps, selectedCatCols: string[], selectedNumCols: string[], updateSelectedCatCols: (s: string[]) => void, updateSelectedNumCols: (s: string[]) => void): void;
    createTrace(props: MultiplesProps, selectedCatCols: string[], selectedNumCols: string[], shapeScale: any, colorScale: any, opacityScale: any, bubbleScale: any): MultipleDataTraces;
}
