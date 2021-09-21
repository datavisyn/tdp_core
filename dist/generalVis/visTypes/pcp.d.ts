import { AllDropdownOptions } from '../types/generalTypes';
import { GeneralPlot } from '../types/generalPlotInterface';
import { PlotlyInfo, GeneralHomeProps } from '../types/generalTypes';
export declare class PlotlyPCP implements GeneralPlot {
    startingHeuristic(props: GeneralHomeProps, selectedCatCols: string[], selectedNumCols: string[], updateSelectedCatCols: (s: string[]) => void, updateSelectedNumCols: (s: string[]) => void): any;
    createTraces(props: GeneralHomeProps, dropdownOptions: AllDropdownOptions, selectedCatCols: string[], selectedNumCols: string[]): PlotlyInfo;
}
