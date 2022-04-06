import { merge, sum, mean, min, max } from 'lodash';
import { median } from 'd3';
import { I18nextManager } from '../../i18n';
import { EColumnTypes, ESupportedPlotlyVis, EBarGroupingType, EBarDisplayType, EBarDirection, EAggregateTypes, } from '../interfaces';
import { resolveSingleColumn, truncateText } from '../general/layoutUtils';
import { getCol } from '../sidebar';
export function isBar(s) {
    return s.type === ESupportedPlotlyVis.BAR;
}
const defaultConfig = {
    type: ESupportedPlotlyVis.BAR,
    numColumnsSelected: [],
    catColumnSelected: null,
    group: null,
    groupType: EBarGroupingType.STACK,
    multiples: null,
    display: EBarDisplayType.ABSOLUTE,
    direction: EBarDirection.HORIZONTAL,
    aggregateColumn: null,
    aggregateType: EAggregateTypes.COUNT,
};
export function barMergeDefaultConfig(columns, config) {
    const merged = merge({}, defaultConfig, config);
    const catCols = columns.filter((c) => c.type === EColumnTypes.CATEGORICAL);
    const numCols = columns.filter((c) => c.type === EColumnTypes.NUMERICAL);
    if (!merged.catColumnSelected && catCols.length > 0) {
        merged.catColumnSelected = catCols[catCols.length - 1].info;
    }
    if (!merged.aggregateColumn && numCols.length > 0) {
        merged.aggregateColumn = numCols[numCols.length - 1].info;
    }
    return merged;
}
function getAggregateValues(aggType, catColValues, aggColValues) {
    const categoricalOptions = [...new Set(catColValues.map((v) => v.val))];
    const categoricalMap = {};
    catColValues.forEach((val) => {
        categoricalMap[val.id] = val.val;
    });
    if (aggType === EAggregateTypes.COUNT) {
        return categoricalOptions.map((curr) => catColValues.filter((c) => c.val === curr).length);
    }
    if (aggType === EAggregateTypes.AVG) {
        return categoricalOptions.map((curr) => mean(aggColValues.filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)));
    }
    if (aggType === EAggregateTypes.MIN) {
        return categoricalOptions.map((curr) => min(aggColValues.filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)));
    }
    if (aggType === EAggregateTypes.MED) {
        return categoricalOptions.map((curr) => median(aggColValues.filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)));
    }
    return categoricalOptions.map((curr) => max(aggColValues.filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)));
}
function getTotalAggregateValues(aggType, categoricalOptions, catColValues, aggColValues) {
    const categoricalMap = {};
    catColValues.forEach((val) => {
        categoricalMap[val.id] = val.val;
    });
    if (aggType === EAggregateTypes.COUNT) {
        return sum(categoricalOptions.map((curr) => catColValues.filter((c) => c.val === curr).length));
    }
    if (aggType === EAggregateTypes.AVG) {
        return sum(categoricalOptions.map((curr) => mean(aggColValues.filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)) || 0));
    }
    if (aggType === EAggregateTypes.MIN) {
        return sum(categoricalOptions.map((curr) => min(aggColValues.filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)) || 0));
    }
    if (aggType === EAggregateTypes.MED) {
        return sum(categoricalOptions.map((curr) => median(aggColValues.filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)) || 0));
    }
    return sum(categoricalOptions.map((curr) => max(aggColValues.filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)) || 0));
}
async function setPlotsWithGroupsAndMultiples(columns, catCol, aggType, aggregateColumn, config, plots, scales, plotCounter) {
    let plotCounterEdit = plotCounter;
    const catColValues = await resolveSingleColumn(catCol);
    const aggColValues = await resolveSingleColumn(aggregateColumn);
    const vertFlag = config.direction === EBarDirection.VERTICAL;
    const normalizedFlag = config.display === EBarDisplayType.NORMALIZED;
    const currGroupColumn = await resolveSingleColumn(getCol(columns, config.group));
    const currMultiplesColumn = await resolveSingleColumn(getCol(columns, config.multiples));
    const uniqueGroupVals = [...new Set(currGroupColumn.resolvedValues.map((v) => v.val))];
    const uniqueMultiplesVals = [...new Set(currMultiplesColumn.resolvedValues.map((v) => v.val))];
    const uniqueColVals = [...new Set(catColValues.resolvedValues.map((v) => v.val))];
    uniqueMultiplesVals.forEach((uniqueMultiples) => {
        const allMultiplesObjsIds = new Set(currMultiplesColumn.resolvedValues.filter((c) => c.val === uniqueMultiples).map((c) => c.id));
        uniqueGroupVals.forEach((uniqueGroup) => {
            const allGroupObjsIds = new Set(currGroupColumn.resolvedValues.filter((c) => c.val === uniqueGroup).map((c) => c.id));
            const aggregateVals = uniqueColVals
                .map((v) => {
                const allObjs = catColValues.resolvedValues.filter((c) => c.val === v);
                const allObjsIds = new Set(allObjs.map((o) => o.id));
                const joinedObjs = allObjs.filter((c) => allGroupObjsIds.has(c.id) && allMultiplesObjsIds.has(c.id));
                const aggregateValues = getAggregateValues(aggType, joinedObjs, aggColValues === null || aggColValues === void 0 ? void 0 : aggColValues.resolvedValues);
                const ungroupedAggregateValues = getTotalAggregateValues(aggType, uniqueMultiplesVals, currMultiplesColumn.resolvedValues.filter((val) => allObjsIds.has(val.id)), aggColValues === null || aggColValues === void 0 ? void 0 : aggColValues.resolvedValues);
                return joinedObjs.length === 0 ? [0] : normalizedFlag ? (aggregateValues[0] / ungroupedAggregateValues) * 100 : aggregateValues;
            })
                .flat();
            plots.push({
                data: {
                    x: vertFlag ? uniqueColVals : aggregateVals,
                    y: !vertFlag ? uniqueColVals : aggregateVals,
                    text: uniqueColVals,
                    textposition: 'none',
                    hoverinfo: vertFlag ? 'y+text' : 'x+text',
                    orientation: vertFlag ? 'v' : 'h',
                    xaxis: plotCounterEdit === 1 ? 'x' : `x${plotCounterEdit}`,
                    yaxis: plotCounterEdit === 1 ? 'y' : `y${plotCounterEdit}`,
                    showlegend: plotCounterEdit === 1,
                    type: 'bar',
                    name: uniqueGroup,
                    marker: {
                        color: scales.color(uniqueGroup),
                    },
                },
                xLabel: vertFlag ? catColValues.info.name : normalizedFlag ? 'Percent of Total' : aggType,
                yLabel: vertFlag ? (normalizedFlag ? 'Percent of Total' : aggType) : catColValues.info.name,
                xTicks: vertFlag ? uniqueColVals : null,
                xTickLabels: vertFlag ? uniqueColVals.map((v) => truncateText(v, 8)) : null,
                yTicks: !vertFlag ? uniqueColVals : null,
                yTickLabels: !vertFlag ? uniqueColVals.map((v) => truncateText(v, 8)) : null,
            });
        });
        plotCounterEdit += 1;
    });
    return plotCounterEdit;
}
async function setPlotsWithGroups(columns, catCol, aggType, aggColumn, config, plots, scales, plotCounter) {
    const catColValues = await resolveSingleColumn(catCol);
    const aggColValues = await resolveSingleColumn(aggColumn);
    const vertFlag = config.direction === EBarDirection.VERTICAL;
    const normalizedFlag = config.display === EBarDisplayType.NORMALIZED;
    const groupColumn = await resolveSingleColumn(getCol(columns, config.group));
    const uniqueGroupVals = [...new Set(groupColumn.resolvedValues.map((v) => v.val))];
    const uniqueColVals = [...new Set(catColValues.resolvedValues.map((v) => v.val))];
    uniqueGroupVals.forEach((uniqueVal) => {
        const allGroupObjsIds = new Set(groupColumn.resolvedValues.filter((c) => c.val === uniqueVal).map((c) => c.id));
        const finalAggregateValues = uniqueColVals
            .map((v) => {
            const allObjs = catColValues.resolvedValues.filter((c) => c.val === v);
            const allObjsIds = new Set(allObjs.map((o) => o.id));
            const joinedObjs = allObjs.filter((allVal) => allGroupObjsIds.has(allVal.id));
            const aggregateValues = getAggregateValues(aggType, joinedObjs, aggColValues === null || aggColValues === void 0 ? void 0 : aggColValues.resolvedValues);
            const ungroupedAggregateValues = getTotalAggregateValues(aggType, uniqueGroupVals, groupColumn.resolvedValues.filter((val) => allObjsIds.has(val.id)), aggColValues === null || aggColValues === void 0 ? void 0 : aggColValues.resolvedValues);
            return joinedObjs.length === 0 ? [0] : normalizedFlag ? (aggregateValues[0] / ungroupedAggregateValues) * 100 : aggregateValues;
        })
            .flat();
        plots.push({
            data: {
                x: vertFlag ? uniqueColVals : finalAggregateValues,
                y: !vertFlag ? uniqueColVals : finalAggregateValues,
                text: uniqueColVals,
                textposition: 'none',
                hoverinfo: vertFlag ? 'y+text' : 'x+text',
                orientation: vertFlag ? 'v' : 'h',
                xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
                yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
                showlegend: plotCounter === 1,
                type: 'bar',
                name: uniqueVal,
                marker: {
                    color: scales.color(uniqueVal),
                },
            },
            xLabel: vertFlag ? catColValues.info.name : normalizedFlag ? 'Percent of Total' : aggType,
            yLabel: vertFlag ? (normalizedFlag ? 'Percent of Total' : aggType) : catColValues.info.name,
            xTicks: vertFlag ? uniqueColVals : null,
            xTickLabels: vertFlag ? uniqueColVals.map((v) => truncateText(v, 8)) : null,
            yTicks: !vertFlag ? uniqueColVals : null,
            yTickLabels: !vertFlag ? uniqueColVals.map((v) => truncateText(v, 8)) : null,
        });
    });
    return plotCounter;
}
async function setPlotsWithMultiples(columns, catCol, aggType, aggColumn, config, plots, plotCounter) {
    let plotCounterEdit = plotCounter;
    const catColValues = await resolveSingleColumn(catCol);
    const aggColValues = await resolveSingleColumn(aggColumn);
    const multiplesColumn = await resolveSingleColumn(getCol(columns, config.multiples));
    const vertFlag = config.direction === EBarDirection.VERTICAL;
    const uniqueMultiplesVals = [...new Set((await multiplesColumn).resolvedValues.map((v) => v.val))];
    const uniqueColVals = [...new Set(catColValues.resolvedValues.map((v) => v.val))];
    uniqueMultiplesVals.forEach((uniqueVal) => {
        const allMultiplesObjsIds = new Set(multiplesColumn.resolvedValues.filter((c) => c.val === uniqueVal).map((c) => c.id));
        const finalAggregateValues = uniqueColVals
            .map((v) => {
            const allObjs = catColValues.resolvedValues.filter((c) => c.val === v);
            const joinedObjs = allObjs.filter((c) => allMultiplesObjsIds.has(c.id));
            const aggregateValues = getAggregateValues(aggType, joinedObjs, aggColValues === null || aggColValues === void 0 ? void 0 : aggColValues.resolvedValues);
            return joinedObjs.length === 0 ? [0] : aggregateValues;
        })
            .flat();
        plots.push({
            data: {
                x: vertFlag ? uniqueColVals : finalAggregateValues,
                y: !vertFlag ? uniqueColVals : finalAggregateValues,
                text: uniqueColVals,
                textposition: 'none',
                hoverinfo: vertFlag ? 'y+text' : 'x+text',
                orientation: vertFlag ? 'v' : 'h',
                xaxis: plotCounterEdit === 1 ? 'x' : `x${plotCounterEdit}`,
                yaxis: plotCounterEdit === 1 ? 'y' : `y${plotCounterEdit}`,
                showlegend: false,
                type: 'bar',
                name: uniqueVal,
            },
            xLabel: vertFlag ? catColValues.info.name : aggType,
            yLabel: vertFlag ? aggType : catColValues.info.name,
            xTicks: vertFlag ? uniqueColVals : null,
            xTickLabels: vertFlag ? uniqueColVals.map((v) => truncateText(v, 8)) : null,
            yTicks: !vertFlag ? uniqueColVals : null,
            yTickLabels: !vertFlag ? uniqueColVals.map((v) => truncateText(v, 8)) : null,
        });
        plotCounterEdit += 1;
    });
    return plotCounterEdit;
}
async function setPlotsBasic(columns, aggType, aggregateColumn, catCol, config, plots, scales, plotCounter) {
    let plotCounterEdit = plotCounter;
    const catColValues = await resolveSingleColumn(catCol);
    const aggColValues = await resolveSingleColumn(aggregateColumn);
    const vertFlag = config.direction === EBarDirection.VERTICAL;
    const aggValues = getAggregateValues(aggType, catColValues.resolvedValues, aggColValues === null || aggColValues === void 0 ? void 0 : aggColValues.resolvedValues);
    const valArr = [...new Set(catColValues.resolvedValues.map((v) => v.val))];
    plots.push({
        data: {
            x: vertFlag ? valArr : aggValues,
            y: !vertFlag ? valArr : aggValues,
            text: valArr,
            textposition: 'none',
            hoverinfo: vertFlag ? 'y+text' : 'x+text',
            ids: valArr,
            orientation: vertFlag ? 'v' : 'h',
            xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
            yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
            type: 'bar',
            name: catColValues.info.name,
            showlegend: false,
        },
        xLabel: vertFlag ? catColValues.info.name : aggType,
        yLabel: vertFlag ? aggType : catColValues.info.name,
        xTicks: vertFlag ? valArr : null,
        xTickLabels: vertFlag ? valArr.map((v) => truncateText(v, 8)) : null,
        yTicks: !vertFlag ? valArr : null,
        yTickLabels: !vertFlag ? valArr.map((v) => truncateText(v, 8)) : null,
    });
    plotCounterEdit += 1;
    return plotCounterEdit;
}
export async function createBarTraces(columns, config, scales) {
    let plotCounter = 1;
    if (!config.catColumnSelected) {
        return {
            plots: [],
            legendPlots: [],
            rows: 0,
            cols: 0,
            errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.barError'),
            errorMessageHeader: I18nextManager.getInstance().i18n.t('tdp:core.vis.errorHeader'),
        };
    }
    const plots = [];
    const catCol = columns.find((c) => c.info.id === config.catColumnSelected.id);
    const aggregateColumn = config.aggregateColumn
        ? columns.find((c) => c.info.id === config.aggregateColumn.id)
        : null;
    if (catCol) {
        if (config.group && config.multiples) {
            plotCounter = await setPlotsWithGroupsAndMultiples(columns, catCol, config.aggregateType, aggregateColumn, config, plots, scales, plotCounter);
        }
        else if (config.group) {
            plotCounter = await setPlotsWithGroups(columns, catCol, config.aggregateType, aggregateColumn, config, plots, scales, plotCounter);
        }
        else if (config.multiples) {
            plotCounter = await setPlotsWithMultiples(columns, catCol, config.aggregateType, aggregateColumn, config, plots, plotCounter);
        }
        else {
            plotCounter = await setPlotsBasic(columns, config.aggregateType, aggregateColumn, catCol, config, plots, scales, plotCounter);
        }
    }
    const rows = Math.ceil(Math.sqrt(plotCounter - 1));
    const cols = Math.ceil((plotCounter - 1) / rows);
    return {
        plots,
        legendPlots: [],
        rows,
        cols,
        errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.barError'),
        errorMessageHeader: I18nextManager.getInstance().i18n.t('tdp:core.vis.errorHeader'),
    };
}
//# sourceMappingURL=utils.js.map