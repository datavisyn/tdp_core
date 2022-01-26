export function isAdditionalColumnDesc(item) {
    return item.selectedId != null;
}
/**
 * mode of the view depending on the view state
 */
export var EViewMode;
(function (EViewMode) {
    EViewMode[EViewMode["FOCUS"] = 0] = "FOCUS";
    EViewMode[EViewMode["CONTEXT"] = 1] = "CONTEXT";
    EViewMode[EViewMode["HIDDEN"] = 2] = "HIDDEN";
})(EViewMode || (EViewMode = {}));
//# sourceMappingURL=interfaces.js.map