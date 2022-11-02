export var ESupportedPlotlyVis;
(function (ESupportedPlotlyVis) {
    ESupportedPlotlyVis["SCATTER"] = "Scatter plot";
    ESupportedPlotlyVis["VIOLIN"] = "Violin plot";
    ESupportedPlotlyVis["STRIP"] = "Strip plot";
    ESupportedPlotlyVis["BAR"] = "Bar chart";
    ESupportedPlotlyVis["HEXBIN"] = "Hexbin plot";
})(ESupportedPlotlyVis || (ESupportedPlotlyVis = {}));
export const allVisTypes = [
    ESupportedPlotlyVis.SCATTER,
    ESupportedPlotlyVis.BAR,
    ESupportedPlotlyVis.VIOLIN,
    ESupportedPlotlyVis.STRIP,
    ESupportedPlotlyVis.HEXBIN,
];
export var EBarDisplayType;
(function (EBarDisplayType) {
    EBarDisplayType["ABSOLUTE"] = "Absolute";
    EBarDisplayType["NORMALIZED"] = "Normalized";
})(EBarDisplayType || (EBarDisplayType = {}));
export var EHexbinOptions;
(function (EHexbinOptions) {
    EHexbinOptions["COLOR"] = "Color";
    EHexbinOptions["PIE"] = "Pie";
    EHexbinOptions["BINS"] = "Bins";
})(EHexbinOptions || (EHexbinOptions = {}));
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
export var EAggregateTypes;
(function (EAggregateTypes) {
    EAggregateTypes["COUNT"] = "Count";
    EAggregateTypes["MIN"] = "Minimum";
    EAggregateTypes["AVG"] = "Average";
    EAggregateTypes["MED"] = "Median";
    EAggregateTypes["MAX"] = "Maximum";
})(EAggregateTypes || (EAggregateTypes = {}));
export var EBarGroupingType;
(function (EBarGroupingType) {
    EBarGroupingType["STACK"] = "Stacked";
    EBarGroupingType["GROUP"] = "Grouped";
})(EBarGroupingType || (EBarGroupingType = {}));
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
    EFilterOptions["CLEAR"] = "Clear";
})(EFilterOptions || (EFilterOptions = {}));
export var ENumericalColorScaleType;
(function (ENumericalColorScaleType) {
    ENumericalColorScaleType["SEQUENTIAL"] = "Sequential";
    ENumericalColorScaleType["DIVERGENT"] = "Divergent";
})(ENumericalColorScaleType || (ENumericalColorScaleType = {}));
export var EScatterSelectSettings;
(function (EScatterSelectSettings) {
    EScatterSelectSettings["RECTANGLE"] = "select";
    EScatterSelectSettings["LASSO"] = "lasso";
    EScatterSelectSettings["ZOOM"] = "zoom";
    EScatterSelectSettings["PAN"] = "pan";
})(EScatterSelectSettings || (EScatterSelectSettings = {}));
//# sourceMappingURL=interfaces.js.map