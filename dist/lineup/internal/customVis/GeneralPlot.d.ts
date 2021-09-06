import { MultipleDataTraces, MultiplesProps } from './Multiples';
export declare abstract class GeneralPlot {
    abstract startingHeuristic(props: MultiplesProps, selectedCatCols: string[], selectedNumCols: string[], updateSelectedCatCols: (s: string[]) => void, updateSelectedNumCols: (s: string[]) => void): any;
    abstract createTrace(props: MultiplesProps, selectedCatCols: string[], selectedNumCols: string[], shapeScale: any, colorScale: any, opacityScale: any, bubbleScale: any): MultipleDataTraces;
}
