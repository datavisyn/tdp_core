import { merge } from 'lodash';
import { EColumnTypes, ESupportedPlotlyVis } from '../interfaces';
import { getCol } from '../utils/sidebarUtils';
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
export function isBar(s) {
    return s.type === ESupportedPlotlyVis.BAR;
}
const defaultConfig = {
    type: ESupportedPlotlyVis.BAR,
    numColumnsSelected: [],
    catColumnsSelected: [],
    group: null,
    groupType: EBarGroupingType.STACK,
    multiples: null,
    display: EBarDisplayType.DEFAULT,
    direction: EBarDirection.VERTICAL,
};
export function barInit(columns, config) {
    const merged = merge(defaultConfig, config);
    const catCols = columns.filter((c) => c.type === EColumnTypes.CATEGORICAL);
    if (merged.catColumnsSelected.length === 0 && catCols.length > 0) {
        merged.catColumnsSelected.push(catCols[catCols.length - 1].info);
    }
    return merged;
}
export function createBarTraces(columns, config, scales) {
    let counter = 1;
    if (!config.catColumnsSelected) {
        return {
            plots: [],
            legendPlots: [],
            rows: 0,
            cols: 0,
            errorMessage: 'To create a Bar Chart, please select at least 1 categorical column.',
            formList: ['groupBy', 'barMultiplesBy', 'barDirection', 'barGroupType', 'barNormalized']
        };
    }
    const catCols = columns.filter((c) => config.catColumnsSelected.filter((d) => c.info.id === d.id).length > 0 && c.type === EColumnTypes.CATEGORICAL);
    const vertFlag = config.direction === EBarDirection.VERTICAL;
    const normalizedFlag = config.display === EBarDisplayType.NORMALIZED;
    const plots = [];
    if (catCols.length > 0) {
        const catCurr = catCols[0];
        if (config.group && config.multiples) {
            const currGroupColumn = getCol(columns, config.group);
            const currMultiplesColumn = getCol(columns, config.multiples);
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
                                color: scales.color(uniqueGroup),
                            }
                        },
                        xLabel: vertFlag ? catCurr.info.name : normalizedFlag ? 'Percent of Total' : 'Count',
                        yLabel: vertFlag ? normalizedFlag ? 'Percent of Total' : 'Count' : catCurr.info.name
                    });
                });
                counter += 1;
            });
        }
        else if (config.group) {
            const currColumn = getCol(columns, config.group);
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
                            color: scales.color(uniqueVal),
                        }
                    },
                    xLabel: vertFlag ? catCurr.info.name : normalizedFlag ? 'Percent of Total' : 'Count',
                    yLabel: vertFlag ? normalizedFlag ? 'Percent of Total' : 'Count' : catCurr.info.name
                });
            });
        }
        else if (config.multiples) {
            const currColumn = getCol(columns, config.multiples);
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
//# sourceMappingURL=bar.js.map