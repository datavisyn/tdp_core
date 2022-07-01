import { merge, sum, mean, min, max } from 'lodash';
import { median } from 'd3';
import { I18nextManager } from '../../i18n';
import { EColumnTypes, ESupportedPlotlyVis, EBarGroupingType, EBarDisplayType, EBarDirection, EAggregateTypes, } from '../interfaces';
import { columnNameWithDescription, resolveSingleColumn, truncateText } from '../general/layoutUtils';
import { getCol } from '../sidebar';
export function isBar(s) {
    return s.type === ESupportedPlotlyVis.BAR;
}
const UNSELECTED_OPACITY = '0.2';
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
const TICK_LABEL_LENGTH = 8;
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
function createAxisLabel(aggregateType, aggregateColumn) {
    return aggregateType === EAggregateTypes.COUNT ? aggregateType : `${aggregateType} of ${columnNameWithDescription(aggregateColumn.info)}`;
}
/**
 * This function finds the faceted values of a given categorical column based on an aggregation type.
 * If isTotal is true, it will sum all of the categorical values, used for normalizing the bar charts.
 * Otherwise, it will return an array of values corresponding to the categoricalOptions argument
 * @param aggregateType Enum for aggregate type
 * @param catColValues Categorical Column which we are visualizing
 * @param aggColValues Numerical Column which we are using for our aggregation type, unless count is the aggregation type.
 * @param _categoricalOptions Optional list of categorical options to find. If not provided, will use a set from the catColValues parameter
 * @param isTotal Boolean for deciding whether or not to summarize the results of the list. Also cleans NaN and undefined values to 0
 * @returns A list of numbers if isTotal is false, a single number if true.
 */
function getAggregateValues(aggregateType, catColValues, aggColValues, _categoricalOptions, isTotal) {
    const categoricalOptions = _categoricalOptions || [...new Set(catColValues.map((v) => v.val))];
    const categoricalMap = {};
    catColValues.forEach((val) => {
        categoricalMap[val.id] = val.val;
    });
    function aggregate(aggFunc) {
        const aggValues = categoricalOptions.map((curr) => aggFunc(aggColValues.filter((c) => categoricalMap[c.id] === curr && !Number.isNaN(c.val)).map((c) => c.val)) || 0);
        return isTotal ? sum(aggValues) : aggValues;
    }
    switch (aggregateType) {
        case EAggregateTypes.AVG:
            return aggregate(mean);
        case EAggregateTypes.MIN:
            return aggregate(min);
        case EAggregateTypes.MAX:
            return aggregate(max);
        case EAggregateTypes.MED:
            return aggregate(median);
        case EAggregateTypes.COUNT: {
            const countValues = categoricalOptions.map((curr) => catColValues.filter((c) => c.val === curr).length);
            return isTotal ? sum(countValues) : countValues;
        }
        default:
            throw new Error('Unknown aggregation type');
    }
}
async function setPlotsWithGroupsAndMultiples(columns, catCol, aggregateType, aggregateColumn, config, plots, scales, plotCounter) {
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
                const aggregateValues = getAggregateValues(aggregateType, joinedObjs, aggColValues === null || aggColValues === void 0 ? void 0 : aggColValues.resolvedValues);
                const ungroupedAggregateValues = getAggregateValues(aggregateType, currMultiplesColumn.resolvedValues.filter((val) => allObjsIds.has(val.id)), aggColValues === null || aggColValues === void 0 ? void 0 : aggColValues.resolvedValues, uniqueMultiplesVals);
                return joinedObjs.length === 0 ? [0] : normalizedFlag ? (aggregateValues[0] / ungroupedAggregateValues) * 100 : aggregateValues;
            })
                .flat();
            const plotAggregateAxisName = createAxisLabel(aggregateType, aggregateColumn);
            let valIdArr = uniqueColVals.map((val) => []);
            catColValues.resolvedValues.forEach((row) => valIdArr[uniqueColVals.indexOf(row.val)].push(row.id));
            // stores the actual points of each bar/section of bar in the custom data.
            valIdArr = valIdArr.map((arr) => arr.filter((val) => allGroupObjsIds.has(val) && allMultiplesObjsIds.has(val)));
            plots.push({
                data: {
                    x: vertFlag ? uniqueColVals : aggregateVals,
                    y: !vertFlag ? uniqueColVals : aggregateVals,
                    text: uniqueColVals,
                    ids: uniqueColVals.map((colVal) => `${colVal}, ${uniqueMultiples}, ${uniqueGroup}`),
                    customdata: valIdArr,
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
                    // @ts-ignore
                    selected: {
                        marker: {
                            opacity: '1',
                        },
                    },
                    unselected: {
                        marker: {
                            opacity: UNSELECTED_OPACITY,
                        },
                    },
                },
                xLabel: vertFlag ? columnNameWithDescription(catColValues.info) : normalizedFlag ? 'Percent of Total' : plotAggregateAxisName,
                yLabel: vertFlag ? (normalizedFlag ? 'Percent of Total' : plotAggregateAxisName) : columnNameWithDescription(catColValues.info),
                xTicks: vertFlag ? uniqueColVals : null,
                xTickLabels: vertFlag ? uniqueColVals.map((v) => truncateText(v, TICK_LABEL_LENGTH)) : null,
                yTicks: !vertFlag ? uniqueColVals : null,
                yTickLabels: !vertFlag ? uniqueColVals.map((v) => truncateText(v, TICK_LABEL_LENGTH)) : null,
            });
        });
        plotCounterEdit += 1;
    });
    return plotCounterEdit;
}
async function setPlotsWithGroups(columns, catCol, aggregateType, aggregateColumn, config, plots, scales, plotCounter) {
    const catColValues = await resolveSingleColumn(catCol);
    const aggColValues = await resolveSingleColumn(aggregateColumn);
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
            const aggregateValues = getAggregateValues(aggregateType, joinedObjs, aggColValues === null || aggColValues === void 0 ? void 0 : aggColValues.resolvedValues);
            const ungroupedAggregateValues = getAggregateValues(aggregateType, groupColumn.resolvedValues.filter((val) => allObjsIds.has(val.id)), aggColValues === null || aggColValues === void 0 ? void 0 : aggColValues.resolvedValues, uniqueGroupVals, true);
            return joinedObjs.length === 0 ? [0] : normalizedFlag ? (aggregateValues[0] / ungroupedAggregateValues) * 100 : aggregateValues;
        })
            .flat();
        const plotAggregateAxisName = createAxisLabel(aggregateType, aggregateColumn);
        let valIdArr = uniqueColVals.map((val) => []);
        catColValues.resolvedValues.forEach((row) => valIdArr[uniqueColVals.indexOf(row.val)].push(row.id));
        // stores the actual points of each bar/section of bar in the custom data.
        valIdArr = valIdArr.map((arr) => arr.filter((val) => allGroupObjsIds.has(val)));
        plots.push({
            data: {
                x: vertFlag ? uniqueColVals : finalAggregateValues,
                y: !vertFlag ? uniqueColVals : finalAggregateValues,
                text: uniqueColVals,
                ids: uniqueColVals.map((colVal) => `${colVal}, ${uniqueVal}`),
                customdata: valIdArr,
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
                // @ts-ignore
                selected: {
                    marker: {
                        opacity: '1',
                    },
                },
                unselected: {
                    marker: {
                        opacity: UNSELECTED_OPACITY,
                    },
                },
            },
            xLabel: vertFlag ? columnNameWithDescription(catColValues.info) : normalizedFlag ? 'Percent of Total' : plotAggregateAxisName,
            yLabel: vertFlag ? (normalizedFlag ? 'Percent of Total' : plotAggregateAxisName) : columnNameWithDescription(catColValues.info),
            xTicks: vertFlag ? uniqueColVals : null,
            xTickLabels: vertFlag ? uniqueColVals.map((v) => truncateText(v, TICK_LABEL_LENGTH)) : null,
            yTicks: !vertFlag ? uniqueColVals : null,
            yTickLabels: !vertFlag ? uniqueColVals.map((v) => truncateText(v, TICK_LABEL_LENGTH)) : null,
        });
    });
    return plotCounter;
}
async function setPlotsWithMultiples(columns, catCol, aggregateType, aggregateColumn, config, plots, plotCounter) {
    let plotCounterEdit = plotCounter;
    const catColValues = await resolveSingleColumn(catCol);
    const aggColValues = await resolveSingleColumn(aggregateColumn);
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
            return joinedObjs.length === 0 ? [0] : getAggregateValues(aggregateType, joinedObjs, aggColValues === null || aggColValues === void 0 ? void 0 : aggColValues.resolvedValues);
        })
            .flat();
        const plotAggregateAxisName = createAxisLabel(aggregateType, aggregateColumn);
        let valIdArr = uniqueColVals.map((val) => []);
        catColValues.resolvedValues.forEach((row) => valIdArr[uniqueColVals.indexOf(row.val)].push(row.id));
        // stores the actual points of each bar/section of bar in the custom data.
        valIdArr = valIdArr.map((arr) => arr.filter((val) => allMultiplesObjsIds.has(val)));
        plots.push({
            data: {
                x: vertFlag ? uniqueColVals : finalAggregateValues,
                y: !vertFlag ? uniqueColVals : finalAggregateValues,
                ids: uniqueColVals.map((colVal) => `${colVal}, ${uniqueVal}`),
                text: uniqueColVals,
                textposition: 'none',
                customdata: valIdArr,
                hoverinfo: vertFlag ? 'y+text' : 'x+text',
                orientation: vertFlag ? 'v' : 'h',
                xaxis: plotCounterEdit === 1 ? 'x' : `x${plotCounterEdit}`,
                yaxis: plotCounterEdit === 1 ? 'y' : `y${plotCounterEdit}`,
                showlegend: false,
                type: 'bar',
                name: uniqueVal,
                // @ts-ignore
                selected: {
                    marker: {
                        opacity: '1',
                    },
                },
                unselected: {
                    marker: {
                        opacity: UNSELECTED_OPACITY,
                    },
                },
            },
            xLabel: vertFlag ? columnNameWithDescription(catColValues.info) : plotAggregateAxisName,
            yLabel: vertFlag ? plotAggregateAxisName : columnNameWithDescription(catColValues.info),
            xTicks: vertFlag ? uniqueColVals : null,
            xTickLabels: vertFlag ? uniqueColVals.map((v) => truncateText(v, TICK_LABEL_LENGTH)) : null,
            yTicks: !vertFlag ? uniqueColVals : null,
            yTickLabels: !vertFlag ? uniqueColVals.map((v) => truncateText(v, TICK_LABEL_LENGTH)) : null,
        });
        plotCounterEdit += 1;
    });
    return plotCounterEdit;
}
async function setPlotsBasic(columns, aggregateType, aggregateColumn, catCol, config, plots, scales, plotCounter) {
    let plotCounterEdit = plotCounter;
    const catColValues = await resolveSingleColumn(catCol);
    const aggColValues = await resolveSingleColumn(aggregateColumn);
    const vertFlag = config.direction === EBarDirection.VERTICAL;
    const aggValues = getAggregateValues(aggregateType, catColValues.resolvedValues, aggColValues === null || aggColValues === void 0 ? void 0 : aggColValues.resolvedValues);
    const valArr = [...new Set(catColValues.resolvedValues.map((v) => v.val))];
    // stores the actual points of each bar/section of bar in the custom data.
    const valIdArr = valArr.map((val) => []);
    catColValues.resolvedValues.forEach((row) => valIdArr[valArr.indexOf(row.val)].push(row.id));
    const plotAggregateAxisName = createAxisLabel(aggregateType, aggregateColumn);
    plots.push({
        data: {
            type: 'bar',
            x: vertFlag ? valArr : aggValues,
            y: !vertFlag ? valArr : aggValues,
            text: valArr,
            textposition: 'none',
            hoverinfo: vertFlag ? 'y+text' : 'x+text',
            ids: valArr,
            // @ts-ignore
            selected: {
                marker: {
                    opacity: '1',
                },
            },
            unselected: {
                marker: {
                    opacity: UNSELECTED_OPACITY,
                },
            },
            customdata: valIdArr,
            orientation: vertFlag ? 'v' : 'h',
            xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
            yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
            name: columnNameWithDescription(catColValues.info),
            showlegend: false,
        },
        xLabel: vertFlag ? columnNameWithDescription(catColValues.info) : plotAggregateAxisName,
        yLabel: vertFlag ? plotAggregateAxisName : columnNameWithDescription(catColValues.info),
        xTicks: vertFlag ? valArr : null,
        xTickLabels: vertFlag ? valArr.map((v) => truncateText(v, TICK_LABEL_LENGTH)) : null,
        yTicks: !vertFlag ? valArr : null,
        yTickLabels: !vertFlag ? valArr.map((v) => truncateText(v, TICK_LABEL_LENGTH)) : null,
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