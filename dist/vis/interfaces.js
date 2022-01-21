export var ESupportedPlotlyVis;
(function (ESupportedPlotlyVis) {
    ESupportedPlotlyVis["SCATTER"] = "Scatter";
    ESupportedPlotlyVis["PCP"] = "Parallel Coordinates";
    ESupportedPlotlyVis["VIOLIN"] = "Violin";
    ESupportedPlotlyVis["STRIP"] = "Strip";
    ESupportedPlotlyVis["BAR"] = "Bar";
})(ESupportedPlotlyVis || (ESupportedPlotlyVis = {}));
export const allVisTypes = [ESupportedPlotlyVis.SCATTER, ESupportedPlotlyVis.BAR, ESupportedPlotlyVis.VIOLIN, ESupportedPlotlyVis.STRIP, ESupportedPlotlyVis.PCP];
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
//# sourceMappingURL=interfaces.js.map