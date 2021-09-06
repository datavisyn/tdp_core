import { MultipleDataTraces, MultiplesProps } from './Multiples';
export declare abstract class GeneralPlot {
    abstract setupHeuristic(): any;
    abstract createTrace(props: MultiplesProps, selectedCatCols: string[], selectedNumCols: string[], shapeScale: any, colorScale: any, opacityScale: any, bubbleScale: any): MultipleDataTraces;
}
