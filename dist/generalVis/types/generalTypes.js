export var ESupportedPlotlyVis;
(function (ESupportedPlotlyVis) {
    ESupportedPlotlyVis["SCATTER"] = "Scatter";
    ESupportedPlotlyVis["PCP"] = "Parallel Coordinates";
    ESupportedPlotlyVis["VIOLIN"] = "Violin";
    ESupportedPlotlyVis["STRIP"] = "Strip";
    ESupportedPlotlyVis["BAR"] = "Bar";
})(ESupportedPlotlyVis || (ESupportedPlotlyVis = {}));
export var EColumnTypes;
(function (EColumnTypes) {
    EColumnTypes["NUMERICAL"] = "Numerical";
    EColumnTypes["CATEGORICAL"] = "Categorical";
})(EColumnTypes || (EColumnTypes = {}));
export var EGeneralFormType;
(function (EGeneralFormType) {
    EGeneralFormType["DROPDOWN"] = "Dropdown";
    EGeneralFormType["BUTTON"] = "Button";
})(EGeneralFormType || (EGeneralFormType = {}));
export const correlationTypes = [ESupportedPlotlyVis.SCATTER];
export const comparisonTypes = [ESupportedPlotlyVis.VIOLIN, ESupportedPlotlyVis.STRIP];
export const distributionTypes = [ESupportedPlotlyVis.BAR];
export const highDimensionalTypes = [ESupportedPlotlyVis.PCP];
//# sourceMappingURL=generalTypes.js.map