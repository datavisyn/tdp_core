import { merge } from 'lodash';
import { I18nextManager } from '../../i18n';
import { EColumnTypes, ESupportedPlotlyVis, } from '../interfaces';
import { columnNameWithDescription, resolveColumnValues } from '../general/layoutUtils';
import { DEFAULT_COLOR, SELECT_COLOR } from '../general/constants';
export function isStrip(s) {
    return s.type === ESupportedPlotlyVis.STRIP;
}
const defaultConfig = {
    type: ESupportedPlotlyVis.STRIP,
    numColumnsSelected: [],
    catColumnsSelected: [],
};
export function stripMergeDefaultConfig(columns, config) {
    const merged = merge({}, defaultConfig, config);
    const numCols = columns.filter((c) => c.type === EColumnTypes.NUMERICAL);
    if (merged.numColumnsSelected.length === 0 && numCols.length > 0) {
        merged.numColumnsSelected.push(numCols[numCols.length - 1].info);
    }
    return merged;
}
export async function createStripTraces(columns, config, selected, scales) {
    let plotCounter = 1;
    if (!config.numColumnsSelected || !config.catColumnsSelected) {
        return {
            plots: [],
            legendPlots: [],
            rows: 0,
            cols: 0,
            errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.stripError'),
            errorMessageHeader: I18nextManager.getInstance().i18n.t('tdp:core.vis.errorHeader'),
        };
    }
    const numCols = config.numColumnsSelected.map((c) => columns.find((col) => col.info.id === c.id));
    const catCols = config.catColumnsSelected.map((c) => columns.find((col) => col.info.id === c.id));
    const plots = [];
    const numColValues = await resolveColumnValues(numCols);
    const catColValues = await resolveColumnValues(catCols);
    // if we only have numerical columns, add them individually
    if (catColValues.length === 0) {
        for (const numCurr of numColValues) {
            plots.push({
                data: {
                    y: numCurr.resolvedValues.map((v) => v.val),
                    xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
                    yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
                    ids: numCurr.resolvedValues.map((v) => v.id.toString()),
                    showlegend: false,
                    type: 'box',
                    boxpoints: 'all',
                    name: 'All points',
                    mode: 'none',
                    pointpos: 0,
                    selectedpoints: numCurr.resolvedValues
                        .map((v, i) => {
                        return { index: i, selected: selected[v.id] };
                    })
                        .filter((v) => v.selected)
                        .map((v) => v.index),
                    // @ts-ignore
                    selected: {
                        marker: {
                            color: SELECT_COLOR,
                            opacity: 1,
                        },
                    },
                    unselected: {
                        marker: {
                            color: DEFAULT_COLOR,
                            opacity: 0.5,
                        },
                    },
                    // @ts-ignore
                    box: {
                        visible: true,
                    },
                    line: {
                        color: 'rgba(255, 255, 255, 0)',
                    },
                },
                xLabel: columnNameWithDescription(numCurr.info),
                yLabel: columnNameWithDescription(numCurr.info),
            });
            plotCounter += 1;
        }
    }
    for (const numCurr of numColValues) {
        for (const catCurr of catColValues) {
            plots.push({
                data: {
                    x: catCurr.resolvedValues.map((v) => v.val),
                    y: numCurr.resolvedValues.map((v) => v.val),
                    ids: numCurr.resolvedValues.map((v) => v.id.toString()),
                    xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
                    yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
                    showlegend: false,
                    type: 'box',
                    boxpoints: 'all',
                    name: 'All points',
                    mode: 'none',
                    pointpos: 0,
                    selectedpoints: catCurr.resolvedValues
                        .map((v, i) => {
                        return { index: i, selected: selected[v.id] };
                    })
                        .filter((v) => v.selected)
                        .map((v) => v.index),
                    // @ts-ignore
                    selected: {
                        marker: {
                            color: SELECT_COLOR,
                            opacity: 1,
                        },
                    },
                    unselected: {
                        marker: {
                            color: DEFAULT_COLOR,
                            opacity: 0.5,
                        },
                    },
                    box: {
                        visible: true,
                    },
                    line: {
                        color: '#FFFFFF',
                    },
                    meanline: {
                        visible: true,
                    },
                    transforms: [
                        {
                            type: 'groupby',
                            groups: catCurr.resolvedValues.map((v) => v.val),
                        },
                    ],
                },
                xLabel: columnNameWithDescription(catCurr.info),
                yLabel: columnNameWithDescription(numCurr.info),
            });
            plotCounter += 1;
        }
    }
    return {
        plots,
        legendPlots: [],
        rows: numColValues.length,
        cols: catColValues.length > 0 ? catColValues.length : 1,
        errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.stripError'),
        errorMessageHeader: I18nextManager.getInstance().i18n.t('tdp:core.vis.errorHeader'),
    };
}
//# sourceMappingURL=utils.js.map