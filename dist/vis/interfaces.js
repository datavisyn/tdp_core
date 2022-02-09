export var ESupportedPlotlyVis;
(function (ESupportedPlotlyVis) {
    ESupportedPlotlyVis["SCATTER"] = "Scatter";
    ESupportedPlotlyVis["PCP"] = "Parallel Coordinates";
    ESupportedPlotlyVis["VIOLIN"] = "Violin";
    ESupportedPlotlyVis["STRIP"] = "Strip";
    ESupportedPlotlyVis["BAR"] = "Bar";
})(ESupportedPlotlyVis || (ESupportedPlotlyVis = {}));
export const allVisTypes = [
    ESupportedPlotlyVis.SCATTER,
    ESupportedPlotlyVis.BAR,
    ESupportedPlotlyVis.VIOLIN,
    ESupportedPlotlyVis.STRIP,
    ESupportedPlotlyVis.PCP,
];
export var EColumnTypes;
(function (EColumnTypes) {
    EColumnTypes["NUMERICAL"] = "Numerical";
    EColumnTypes["CATEGORICAL"] = "Categorical";
})(EColumnTypes || (EColumnTypes = {}));
export var EGeneralFormType;
(function (EGeneralFormType) {
    EGeneralFormType["DROPDOWN"] = "Dropdown";
    EGeneralFormType["BUTTON"] = "Button";
    EGeneralFormType["SLIDER"] = "Slider";
})(EGeneralFormType || (EGeneralFormType = {}));
export var EFilterOptions;
(function (EFilterOptions) {
    EFilterOptions["IN"] = "Filter In";
    EFilterOptions["OUT"] = "Filter Out";
    EFilterOptions["CLEAR"] = "Clear Filter";
})(EFilterOptions || (EFilterOptions = {}));
/**
 * Bar chart enums
 */
export var EBarDisplayType;
(function (EBarDisplayType) {
    EBarDisplayType["DEFAULT"] = "Default";
    EBarDisplayType["NORMALIZED"] = "Normalized";
})(EBarDisplayType || (EBarDisplayType = {}));
export var EBarDirection;
(function (EBarDirection) {
    EBarDirection["VERTICAL"] = "Vertical";
    EBarDirection["HORIZONTAL"] = "Horizontal";
})(EBarDirection || (EBarDirection = {}));
export var EViolinOverlay;
(function (EViolinOverlay) {
    EViolinOverlay["NONE"] = "None";
    EViolinOverlay["STRIP"] = "Strip";
    EViolinOverlay["BOX"] = "Box";
})(EViolinOverlay || (EViolinOverlay = {}));
export var EBarGroupingType;
(function (EBarGroupingType) {
    EBarGroupingType["STACK"] = "Stacked";
    EBarGroupingType["GROUP"] = "Grouped";
})(EBarGroupingType || (EBarGroupingType = {}));
/**
 * Scatter chart enums
 */
export var ENumericalColorScaleType;
(function (ENumericalColorScaleType) {
    ENumericalColorScaleType["SEQUENTIAL"] = "Sequential";
    ENumericalColorScaleType["DIVERGENT"] = "Divergent";
})(ENumericalColorScaleType || (ENumericalColorScaleType = {}));
//# sourceMappingURL=interfaces.js.map