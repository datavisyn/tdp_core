import { AllDropdownOptions } from '../types/generalTypes';
import { GeneralPlot } from '../types/generalPlotInterface';
import { PlotlyInfo, GeneralHomeProps } from '../types/generalTypes';
export declare enum EBarDisplayType {
    DEFAULT = "Default",
    NORMALIZED = "Normalized"
}
export declare enum EBarDirection {
    VERTICAL = "Vertical",
    HORIZONTAL = "Horizontal"
}
export declare enum EBarGroupingType {
    STACK = "Stacked",
    GROUP = "Grouped"
}
export declare class PlotlyBar implements GeneralPlot {
    startingHeuristic(props: GeneralHomeProps, selectedCatCols: string[], selectedNumCols: string[], updateSelectedCatCols: (s: string[]) => void, updateSelectedNumCols: (s: string[]) => void): void;
    createTraces(props: GeneralHomeProps, dropdownOptions: AllDropdownOptions, selectedCatCols: string[], selectedNumCols: string[]): PlotlyInfo;
}
