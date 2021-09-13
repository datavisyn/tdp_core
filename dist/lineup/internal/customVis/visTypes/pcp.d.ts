import { AllDropdownOptions } from '../components/GeneralHome';
import { GeneralPlot } from '../generalPlotInterface';
import { MultipleDataTraces, MultiplesProps } from '../components/GeneralHome';
export declare class PlotlyPCP extends GeneralPlot {
    startingHeuristic(props: MultiplesProps, selectedCatCols: string[], selectedNumCols: string[], updateSelectedCatCols: (s: string[]) => void, updateSelectedNumCols: (s: string[]) => void): any;
    createTrace(props: MultiplesProps, dropdownOptions: AllDropdownOptions, selectedCatCols: string[], selectedNumCols: string[]): MultipleDataTraces;
}
