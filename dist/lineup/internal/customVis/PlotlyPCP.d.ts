import { AllDropdownOptions } from './Multiples';
import { GeneralPlot } from './GeneralPlot';
import { MultipleDataTraces, MultiplesProps } from './Multiples';
export declare class PlotlyPCP extends GeneralPlot {
    startingHeuristic(props: MultiplesProps, selectedCatCols: string[], selectedNumCols: string[], updateSelectedCatCols: (s: string[]) => void, updateSelectedNumCols: (s: string[]) => void): any;
    createTrace(props: MultiplesProps, dropdownOptions: AllDropdownOptions, selectedCatCols: string[], selectedNumCols: string[]): MultipleDataTraces;
}
