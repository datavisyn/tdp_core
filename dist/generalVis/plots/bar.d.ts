import { AllDropdownOptions, ColumnInfo } from '../types/generalTypes';
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
export declare enum EViolinOverlay {
    NONE = "None",
    STRIP = "Strip",
    BOX = "Box"
}
export declare enum EBarGroupingType {
    STACK = "Stacked",
    GROUP = "Grouped"
}
export declare class PlotlyBar implements GeneralPlot {
    startingHeuristic(props: GeneralHomeProps, selectedCatCols: ColumnInfo[], selectedNumCols: ColumnInfo[], updateSelectedCatCols: (s: ColumnInfo[]) => void, updateSelectedNumCols: (s: ColumnInfo[]) => void): void;
    createTraces(props: GeneralHomeProps, dropdownOptions: AllDropdownOptions, selectedCatCols: ColumnInfo[], selectedNumCols: ColumnInfo[]): PlotlyInfo;
}
