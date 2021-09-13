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
export var EBarGroupingType;
(function (EBarGroupingType) {
    EBarGroupingType["STACK"] = "Stacked";
    EBarGroupingType["GROUP"] = "Grouped";
})(EBarGroupingType || (EBarGroupingType = {}));
export class PlotlyBar {
    startingHeuristic(props, selectedCatCols, selectedNumCols, updateSelectedCatCols, updateSelectedNumCols) {
        const catCols = props.columns.filter((c) => EColumnTypes.CATEGORICAL);
        if (selectedCatCols.length === 0 && catCols.length >= 1) {
            updateSelectedCatCols([catCols[0].name]);
        }
    }
    createTraces(props, dropdownOptions, selectedCatCols, selectedNumCols) {
        let counter = 1;
        const catCols = props.columns.filter((c) => selectedCatCols.includes(c.name) && EColumnTypes.CATEGORICAL);
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
                            xLabel: catCurr.name,
                            yLabel: normalizedFlag ? 'Percent of Total' : 'Count'
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
                        xLabel: catCurr.name,
                        yLabel: normalizedFlag ? 'Percent of Total' : 'Count'
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
                        xLabel: catCurr.name,
                        yLabel: normalizedFlag ? 'Percent of Total' : 'Count'
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
                        name: catCurr.name
                    },
                    xLabel: catCurr.name,
                    yLabel: normalizedFlag ? 'Percent of Total' : 'Count'
                });
            }
            counter += 1;
        }
        return {
            plots,
            legendPlots: [],
            rows: Math.ceil(Math.sqrt(plots.length)),
            cols: Math.ceil(Math.sqrt(plots.length)),
            errorMessage: 'To create a Strip plot, please select at least 1 categorical column and at least 1 numerical column.',
            dropdownList: ['Group', 'Small Multiples', 'Bar Direction', 'Bar Group By', 'Bar Normalized']
        };
    }
}
//# sourceMappingURL=bar.js.map