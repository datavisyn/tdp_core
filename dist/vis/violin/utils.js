import { merge } from 'lodash';
import { EColumnTypes, ESupportedPlotlyVis, EViolinOverlay, } from '../interfaces';
import { resolveColumnValues } from '../general/layoutUtils';
import { I18nextManager } from '../../i18n';
export function isViolin(s) {
    return s.type === ESupportedPlotlyVis.VIOLIN;
}
const defaultConfig = {
    type: ESupportedPlotlyVis.VIOLIN,
    numColumnsSelected: [],
    catColumnsSelected: [],
    violinOverlay: EViolinOverlay.NONE,
};
export function violinMergeDefaultConfig(columns, config) {
    const merged = merge({}, defaultConfig, config);
    const numCols = columns.filter((c) => c.type === EColumnTypes.NUMERICAL);
    if (merged.numColumnsSelected.length === 0 && numCols.length > 0) {
        merged.numColumnsSelected.push(numCols[numCols.length - 1].info);
    }
    return merged;
}
export async function createViolinTraces(columns, config, scales) {
    let plotCounter = 1;
    if (!config.numColumnsSelected || !config.catColumnsSelected) {
        return {
            plots: [],
            legendPlots: [],
            rows: 0,
            cols: 0,
            errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.violinError'),
            errorMessageHeader: I18nextManager.getInstance().i18n.t('tdp:core.vis.errorHeader'),
        };
    }
    const numCols = config.numColumnsSelected.map((c) => columns.find((col) => col.info.id === c.id));
    const catCols = config.catColumnsSelected.map((c) => columns.find((col) => col.info.id === c.id));
    const plots = [];
    const numColValues = await resolveColumnValues(numCols);
    const catColValues = await resolveColumnValues(catCols);
    // if we onl have numerical columns, add them individually.
    if (catColValues.length === 0) {
        for (const numCurr of numColValues) {
            plots.push({
                data: {
                    y: numCurr.resolvedValues.map((v) => v.val),
                    xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
                    yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
                    type: 'violin',
                    pointpos: 0,
                    jitter: 0.3,
                    // @ts-ignore
                    hoveron: 'violins',
                    points: config.violinOverlay === EViolinOverlay.STRIP ? 'all' : false,
                    box: {
                        visible: config.violinOverlay === EViolinOverlay.BOX,
                    },
                    meanline: {
                        visible: true,
                    },
                    name: `${numCurr.info.name}`,
                    hoverinfo: 'y',
                    scalemode: 'width',
                    showlegend: false,
                },
                xLabel: numCurr.info.name,
                yLabel: numCurr.info.name,
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
                    xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
                    yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
                    type: 'violin',
                    // @ts-ignore
                    hoveron: 'violins',
                    hoverinfo: 'y',
                    meanline: {
                        visible: true,
                    },
                    name: `${catCurr.info.name} + ${numCurr.info.name}`,
                    scalemode: 'width',
                    pointpos: 0,
                    jitter: 0.3,
                    points: config.violinOverlay === EViolinOverlay.STRIP ? 'all' : false,
                    box: {
                        visible: config.violinOverlay === EViolinOverlay.BOX,
                    },
                    showlegend: false,
                    transforms: [
                        {
                            type: 'groupby',
                            groups: catCurr.resolvedValues.map((v) => v.val),
                            styles: [...new Set(catCurr.resolvedValues.map((v) => v.val))].map((c) => {
                                return { target: c, value: { line: { color: scales.color(c) } } };
                            }),
                        },
                    ],
                },
                xLabel: catCurr.info.name,
                yLabel: numCurr.info.name,
            });
            plotCounter += 1;
        }
    }
    return {
        plots,
        legendPlots: [],
        rows: numColValues.length,
        cols: catColValues.length > 0 ? catColValues.length : 1,
        errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.violinError'),
        errorMessageHeader: I18nextManager.getInstance().i18n.t('tdp:core.vis.errorHeader'),
    };
}
//# sourceMappingURL=utils.js.map