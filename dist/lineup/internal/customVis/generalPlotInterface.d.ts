import { AllDropdownOptions, MultipleDataTraces, MultiplesProps } from './components/GeneralHome';
export declare abstract class GeneralPlot {
    abstract startingHeuristic(props: MultiplesProps, selectedCatCols: string[], selectedNumCols: string[], updateSelectedCatCols: (s: string[]) => void, updateSelectedNumCols: (s: string[]) => void): any;
    abstract createTrace(props: MultiplesProps, dropdownOptions: AllDropdownOptions, selectedCatCols: string[], selectedNumCols: string[]): MultipleDataTraces;
}
