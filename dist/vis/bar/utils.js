import { merge, sum, mean, min, max } from 'lodash';
import { median } from 'd3v7';
import { I18nextManager } from '../../i18n';
import { EColumnTypes, ESupportedPlotlyVis, EBarGroupingType, EBarDisplayType, EBarDirection, EAggregateTypes, } from '../interfaces';
import { resolveSingleColumn } from '../general/layoutUtils';
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
    direction: EBarDirection.VERTICAL,
    aggregateColumn: null,
    aggregateType: EAggregateTypes.COUNT,
};
export function barMergeDefaultConfig(columns, config) {
    const merged = merge({}, defaultConfig, config);
    const catCols = columns.filter((c) => c.type === EColumnTypes.CATEGORICAL);
    if (!merged.catColumnSelected && catCols.length > 0) {
        merged.catColumnSelected = catCols[catCols.length - 1].info;
    }
    return merged;
}
async function getAggregateValues(aggType, categoricalColumn, aggregateColumn) {
    const catColValues = await resolveSingleColumn(categoricalColumn);
    const aggColValues = await resolveSingleColumn(aggregateColumn);
    const categoricalOptions = [...new Set(catColValues.resolvedValues.map((v) => v.val))];
    const categoricalMap = {};
    catColValues.resolvedValues.forEach((val) => {
        categoricalMap[val.id] = val.val;
    });
    if (aggType === EAggregateTypes.COUNT) {
        return categoricalOptions.map((curr) => catColValues.resolvedValues.filter((c) => c.val === curr).length);
    }
    if (aggType === EAggregateTypes.AVG) {
        return categoricalOptions.map((curr) => mean(aggColValues.resolvedValues.filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)));
    }
    if (aggType === EAggregateTypes.MIN) {
        return categoricalOptions.map((curr) => min(aggColValues.resolvedValues.filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)));
    }
    if (aggType === EAggregateTypes.MED) {
        return categoricalOptions.map((curr) => median(aggColValues.resolvedValues.filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)));
    }
    return categoricalOptions.map((curr) => max(aggColValues.resolvedValues.filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)));
}
async function setPlotsWithGroupsAndMultiples(columns, catCol, config, plots, scales, plotCounter) {
    let plotCounterEdit = plotCounter;
    const catColValues = await resolveSingleColumn(catCol);
    const vertFlag = config.direction === EBarDirection.VERTICAL;
    const normalizedFlag = config.display === EBarDisplayType.NORMALIZED;
    const currGroupColumn = await resolveSingleColumn(getCol(columns, config.group));
    const currMultiplesColumn = await resolveSingleColumn(getCol(columns, config.multiples));
    const uniqueGroupVals = [...new Set(currGroupColumn.resolvedValues.map((v) => v.val))];
    const uniqueMultiplesVals = [...new Set(currMultiplesColumn.resolvedValues.map((v) => v.val))];
    const uniqueColVals = [...new Set(catColValues.resolvedValues.map((v) => v.val))];
    uniqueMultiplesVals.forEach((uniqueMultiples) => {
        uniqueGroupVals.forEach((uniqueGroup) => {
            const groupedLength = uniqueColVals.map((v) => {
                const allObjs = catColValues.resolvedValues.filter((c) => c.val === v).map((c) => c.id);
                const allGroupObjs = currGroupColumn.resolvedValues.filter((c) => c.val === uniqueGroup).map((c) => c.id);
                const allMultiplesObjs = currMultiplesColumn.resolvedValues.filter((c) => c.val === uniqueMultiples).map((c) => c.id);
                const joinedObjs = allObjs.filter((c) => allGroupObjs.includes(c) && allMultiplesObjs.includes(c));
                return normalizedFlag ? (joinedObjs.length / allObjs.length) * 100 : joinedObjs.length;
            });
            plots.push({
                data: {
                    x: vertFlag ? [...new Set(catColValues.resolvedValues.map((v) => v.val))] : groupedLength,
                    y: !vertFlag ? [...new Set(catColValues.resolvedValues.map((v) => v.val))] : groupedLength,
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
                xLabel: vertFlag ? catColValues.info.name : normalizedFlag ? 'Percent of Total' : 'Count',
                yLabel: vertFlag ? (normalizedFlag ? 'Percent of Total' : 'Count') : catColValues.info.name,
            });
        });
        plotCounterEdit += 1;
    });
    return plotCounterEdit;
}
async function setPlotsWithGroups(columns, catCol, config, plots, scales, plotCounter) {
    const catColValues = await resolveSingleColumn(catCol);
    const vertFlag = config.direction === EBarDirection.VERTICAL;
    const normalizedFlag = config.display === EBarDisplayType.NORMALIZED;
    const groupColumn = await resolveSingleColumn(getCol(columns, config.group));
    const uniqueGroupVals = [...new Set(groupColumn.resolvedValues.map((v) => v.val))];
    const uniqueColVals = [...new Set(catColValues.resolvedValues.map((v) => v.val))];
    uniqueGroupVals.forEach((uniqueVal) => {
        const groupedLength = uniqueColVals.map((v) => {
            const allObjs = catColValues.resolvedValues.filter((c) => c.val === v).map((c) => c.id);
            const allGroupObjs = groupColumn.resolvedValues.filter((c) => c.val === uniqueVal).map((c) => c.id);
            const joinedObjs = allObjs.filter((c) => allGroupObjs.includes(c));
            return normalizedFlag ? (joinedObjs.length / allObjs.length) * 100 : joinedObjs.length;
        });
        plots.push({
            data: {
                x: vertFlag ? [...new Set(catColValues.resolvedValues.map((v) => v.val))] : groupedLength,
                y: !vertFlag ? [...new Set(catColValues.resolvedValues.map((v) => v.val))] : groupedLength,
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
            xLabel: vertFlag ? catColValues.info.name : normalizedFlag ? 'Percent of Total' : 'Count',
            yLabel: vertFlag ? (normalizedFlag ? 'Percent of Total' : 'Count') : catColValues.info.name,
        });
    });
    return plotCounter;
}
async function setPlotsWithMultiples(columns, catCol, config, plots, plotCounter) {
    let plotCounterEdit = plotCounter;
    const catColValues = await resolveSingleColumn(catCol);
    const vertFlag = config.direction === EBarDirection.VERTICAL;
    const normalizedFlag = config.display === EBarDisplayType.NORMALIZED;
    const multiplesColumn = await resolveSingleColumn(getCol(columns, config.multiples));
    const uniqueMultiplesVals = [...new Set((await multiplesColumn).resolvedValues.map((v) => v.val))];
    const uniqueColVals = [...new Set(catColValues.resolvedValues.map((v) => v.val))];
    uniqueMultiplesVals.forEach((uniqueVal) => {
        const multiplesLength = uniqueColVals.map((v) => {
            const allObjs = catColValues.resolvedValues.filter((c) => c.val === v).map((c) => c.id);
            const allMultiplesObjs = multiplesColumn.resolvedValues.filter((c) => c.val === uniqueVal).map((c) => c.id);
            const joinedObjs = allObjs.filter((c) => allMultiplesObjs.includes(c));
            return normalizedFlag ? (joinedObjs.length / allObjs.length) * 100 : joinedObjs.length;
        });
        plots.push({
            data: {
                x: vertFlag ? [...new Set(catColValues.resolvedValues.map((v) => v.val))] : multiplesLength,
                y: !vertFlag ? [...new Set(catColValues.resolvedValues.map((v) => v.val))] : multiplesLength,
                orientation: vertFlag ? 'v' : 'h',
                xaxis: plotCounterEdit === 1 ? 'x' : `x${plotCounterEdit}`,
                yaxis: plotCounterEdit === 1 ? 'y' : `y${plotCounterEdit}`,
                showlegend: plotCounterEdit === 1,
                type: 'bar',
                name: uniqueVal,
            },
            xLabel: vertFlag ? catColValues.info.name : normalizedFlag ? 'Percent of Total' : 'Count',
            yLabel: vertFlag ? (normalizedFlag ? 'Percent of Total' : 'Count') : catColValues.info.name,
        });
        plotCounterEdit += 1;
    });
    return plotCounterEdit;
}
async function setPlotsBasic(columns, aggType, aggregateColumn, catCol, config, plots, scales, plotCounter) {
    let plotCounterEdit = plotCounter;
    const catColValues = await resolveSingleColumn(catCol);
    const vertFlag = config.direction === EBarDirection.VERTICAL;
    const normalizedFlag = config.display === EBarDisplayType.NORMALIZED;
    const aggValues = await getAggregateValues(aggType, catCol, aggregateColumn);
    const countTotal = sum(aggValues);
    const valArr = [...new Set(catColValues.resolvedValues.map((v) => v.val))];
    plots.push({
        data: {
            x: vertFlag ? valArr : normalizedFlag ? aggValues.map((c) => c / countTotal) : aggValues,
            y: !vertFlag ? valArr : normalizedFlag ? aggValues.map((c) => c / countTotal) : aggValues,
            ids: valArr,
            orientation: vertFlag ? 'v' : 'h',
            xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
            yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
            type: 'bar',
            name: catColValues.info.name,
        },
        xLabel: vertFlag ? catColValues.info.name : normalizedFlag ? 'Percent of Total' : 'Count',
        yLabel: vertFlag ? (normalizedFlag ? 'Percent of Total' : 'Count') : catColValues.info.name,
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
            plotCounter = await setPlotsWithGroupsAndMultiples(columns, catCol, config, plots, scales, plotCounter);
        }
        else if (config.group) {
            plotCounter = await setPlotsWithGroups(columns, catCol, config, plots, scales, plotCounter);
        }
        else if (config.multiples) {
            plotCounter = await setPlotsWithMultiples(columns, catCol, config, plots, plotCounter);
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