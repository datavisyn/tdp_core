import { EColumnTypes } from '../types/generalTypes';
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
export class PlotlyBar {
    startingHeuristic(props, selectedCatCols, selectedNumCols, updateSelectedCatCols, updateSelectedNumCols) {
        const catCols = props.columns.filter((c) => c.type === EColumnTypes.CATEGORICAL);
        if (selectedCatCols.length === 0 && catCols.length >= 1) {
            updateSelectedCatCols([catCols[0].info]);
        }
    }
    createTraces(props, dropdownOptions, selectedCatCols, selectedNumCols) {
        let counter = 1;
        const catCols = props.columns.filter((c) => selectedCatCols.filter((d) => c.info.id === d.id).length > 0 && c.type === EColumnTypes.CATEGORICAL);
        const vertFlag = dropdownOptions.barDirection.currentSelected === EBarDirection.VERTICAL;
        const normalizedFlag = dropdownOptions.barNormalized.currentSelected === EBarDisplayType.NORMALIZED;
        const plots = [];
        if (catCols.length > 0) {
            const catCurr = catCols[0];
            if (dropdownOptions.groupBy.currentColumn && dropdownOptions.barMultiplesBy.currentColumn) {
                const currGroupColumn = dropdownOptions.groupBy.currentColumn;
                const currMultiplesColumn = dropdownOptions.barMultiplesBy.currentColumn;
                const uniqueGroupVals = [...new Set(currGroupColumn.vals.map((v) => v.val))];
                const uniqueMultiplesVals = [...new Set(currMultiplesColumn.vals.map((v) => v.val))];
                const uniqueColVals = [...new Set(catCurr.vals.map((v) => v.val))];
                uniqueMultiplesVals.forEach((uniqueMultiples) => {
                    uniqueGroupVals.forEach((uniqueGroup) => {
                        const groupedLength = uniqueColVals.map((v) => {
                            const allObjs = catCurr.vals.filter((c) => c.val === v).map((c) => c.id);
                            const allGroupObjs = currGroupColumn.vals.filter((c) => c.val === uniqueGroup).map((c) => c.id);
                            const allMultiplesObjs = currMultiplesColumn.vals.filter((c) => c.val === uniqueMultiples).map((c) => c.id);
                            const joinedObjs = allObjs.filter((c) => allGroupObjs.includes(c) && allMultiplesObjs.includes(c));
                            return normalizedFlag ? joinedObjs.length / allObjs.length * 100 : joinedObjs.length;
                        });
                        plots.push({
                            data: {
                                x: vertFlag ? [...new Set(catCurr.vals.map((v) => v.val))] : groupedLength,
                                y: !vertFlag ? [...new Set(catCurr.vals.map((v) => v.val))] : groupedLength,
                                orientation: vertFlag ? 'v' : 'h',
                                xaxis: counter === 1 ? 'x' : 'x' + counter,
                                yaxis: counter === 1 ? 'y' : 'y' + counter,
                                showlegend: counter === 1 ? true : false,
                                type: 'bar',
                                name: uniqueGroup,
                                marker: {
                                    color: dropdownOptions.color.scale(uniqueGroup),
                                }
                            },
                            xLabel: vertFlag ? catCurr.info.name : normalizedFlag ? 'Percent of Total' : 'Count',
                            yLabel: vertFlag ? normalizedFlag ? 'Percent of Total' : 'Count' : catCurr.info.name
                        });
                    });
                    counter += 1;
                });
            }
            else if (dropdownOptions.groupBy.currentColumn) {
                const currColumn = dropdownOptions.groupBy.currentColumn;
                const uniqueGroupVals = [...new Set(currColumn.vals.map((v) => v.val))];
                const uniqueColVals = [...new Set(catCurr.vals.map((v) => v.val))];
                uniqueGroupVals.forEach((uniqueVal) => {
                    const groupedLength = uniqueColVals.map((v) => {
                        const allObjs = catCurr.vals.filter((c) => c.val === v).map((c) => c.id);
                        const allGroupObjs = currColumn.vals.filter((c) => c.val === uniqueVal).map((c) => c.id);
                        const joinedObjs = allObjs.filter((c) => allGroupObjs.includes(c));
                        return normalizedFlag ? joinedObjs.length / allObjs.length * 100 : joinedObjs.length;
                    });
                    plots.push({
                        data: {
                            x: vertFlag ? [...new Set(catCurr.vals.map((v) => v.val))] : groupedLength,
                            y: !vertFlag ? [...new Set(catCurr.vals.map((v) => v.val))] : groupedLength,
                            orientation: vertFlag ? 'v' : 'h',
                            xaxis: counter === 1 ? 'x' : 'x' + counter,
                            yaxis: counter === 1 ? 'y' : 'y' + counter,
                            showlegend: counter === 1 ? true : false,
                            type: 'bar',
                            name: uniqueVal,
                            marker: {
                                color: dropdownOptions.color.scale(uniqueVal),
                            }
                        },
                        xLabel: vertFlag ? catCurr.info.name : normalizedFlag ? 'Percent of Total' : 'Count',
                        yLabel: vertFlag ? normalizedFlag ? 'Percent of Total' : 'Count' : catCurr.info.name
                    });
                });
            }
            else if (dropdownOptions.barMultiplesBy.currentColumn) {
                const currColumn = dropdownOptions.barMultiplesBy.currentColumn;
                const uniqueGroupVals = [...new Set(currColumn.vals.map((v) => v.val))];
                const uniqueColVals = [...new Set(catCurr.vals.map((v) => v.val))];
                uniqueGroupVals.forEach((uniqueVal) => {
                    const groupedLength = uniqueColVals.map((v) => {
                        const allObjs = catCurr.vals.filter((c) => c.val === v).map((c) => c.id);
                        const allGroupObjs = currColumn.vals.filter((c) => c.val === uniqueVal).map((c) => c.id);
                        const joinedObjs = allObjs.filter((c) => allGroupObjs.includes(c));
                        return normalizedFlag ? joinedObjs.length / allObjs.length * 100 : joinedObjs.length;
                    });
                    plots.push({
                        data: {
                            x: vertFlag ? [...new Set(catCurr.vals.map((v) => v.val))] : groupedLength,
                            y: !vertFlag ? [...new Set(catCurr.vals.map((v) => v.val))] : groupedLength,
                            orientation: vertFlag ? 'v' : 'h',
                            xaxis: counter === 1 ? 'x' : 'x' + counter,
                            yaxis: counter === 1 ? 'y' : 'y' + counter,
                            showlegend: counter === 1 ? true : false,
                            type: 'bar',
                            name: uniqueVal,
                        },
                        xLabel: vertFlag ? catCurr.info.name : normalizedFlag ? 'Percent of Total' : 'Count',
                        yLabel: vertFlag ? normalizedFlag ? 'Percent of Total' : 'Count' : catCurr.info.name
                    });
                    counter += 1;
                });
            }
            else {
                const count = [...new Set(catCurr.vals.map((v) => v.val))].map((curr) => catCurr.vals.filter((c) => c.val === curr).length);
                const valArr = [...new Set(catCurr.vals.map((v) => v.val))];
                plots.push({
                    data: {
                        x: vertFlag ? valArr : count,
                        y: !vertFlag ? valArr : count,
                        orientation: vertFlag ? 'v' : 'h',
                        xaxis: counter === 1 ? 'x' : 'x' + counter,
                        yaxis: counter === 1 ? 'y' : 'y' + counter,
                        type: 'bar',
                        name: catCurr.info.name
                    },
                    xLabel: vertFlag ? catCurr.info.name : normalizedFlag ? 'Percent of Total' : 'Count',
                    yLabel: vertFlag ? normalizedFlag ? 'Percent of Total' : 'Count' : catCurr.info.name
                });
                counter += 1;
            }
        }
        const rows = Math.ceil(Math.sqrt(counter - 1));
        const cols = Math.ceil((counter - 1) / rows);
        return {
            plots,
            legendPlots: [],
            rows,
            cols,
            errorMessage: 'To create a Bar Chart, please select at least 1 categorical column.',
            formList: ['groupBy', 'barMultiplesBy', 'barDirection', 'barGroupType', 'barNormalized']
        };
    }
}
//# sourceMappingURL=bar.js.map