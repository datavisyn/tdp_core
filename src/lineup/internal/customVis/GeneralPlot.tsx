import {MultipleDataTraces, MultiplesPlot, MultiplesProps} from './Multiples';

export abstract class GeneralPlot {
    abstract startingHeuristic(props: MultiplesProps, selectedCatCols: string[], selectedNumCols: string[], updateSelectedCatCols: (s: string[]) => void, updateSelectedNumCols: (s: string[]) => void);
    abstract createTrace(props: MultiplesProps, selectedCatCols: string[], selectedNumCols: string[], shapeScale, colorScale, opacityScale, bubbleScale): MultipleDataTraces;
}
