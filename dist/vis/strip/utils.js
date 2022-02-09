import { merge } from 'lodash';
import { EColumnTypes, ESupportedPlotlyVis } from '../interfaces';
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
export function createStripTraces(columns, config, scales) {
    let plotCounter = 1;
    if (!config.numColumnsSelected || !config.catColumnsSelected) {
        return {
            plots: [],
            legendPlots: [],
            rows: 0,
            cols: 0,
            errorMessage: 'To create a Strip plot, please select at least 1 numerical column.',
        };
    }
    const numCols = columns.filter((c) => config.numColumnsSelected.some((d) => c.info.id === d.id) && c.type === EColumnTypes.NUMERICAL);
    const catCols = columns.filter((c) => config.catColumnsSelected.some((d) => c.info.id === d.id) && c.type === EColumnTypes.CATEGORICAL);
    const plots = [];
    // if we only have numerical columns, add them individually
    if (catCols.length === 0) {
        for (const numCurr of numCols) {
            plots.push({
                data: {
                    y: numCurr.values.map((v) => v.val),
                    xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
                    yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
                    showlegend: false,
                    type: 'box',
                    boxpoints: 'all',
                    name: 'All points',
                    mode: 'none',
                    pointpos: 0,
                    box: {
                        visible: true,
                    },
                    line: {
                        color: 'rgba(255,255,255,0)',
                    },
                    marker: {
                        color: '#337ab7',
                    },
                },
                xLabel: numCurr.info.name,
                yLabel: numCurr.info.name,
            });
            plotCounter += 1;
        }
    }
    for (const numCurr of numCols) {
        for (const catCurr of catCols) {
            plots.push({
                data: {
                    x: catCurr.values.map((v) => v.val),
                    y: numCurr.values.map((v) => v.val),
                    xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
                    yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
                    showlegend: false,
                    type: 'box',
                    boxpoints: 'all',
                    name: 'All points',
                    mode: 'none',
                    pointpos: 0,
                    box: {
                        visible: true,
                    },
                    line: {
                        color: 'rgba(255,255,255,0)',
                    },
                    meanline: {
                        visible: true,
                    },
                    transforms: [
                        {
                            type: 'groupby',
                            groups: catCurr.values.map((v) => v.val),
                            styles: [...new Set(catCurr.values.map((v) => v.val))].map((c) => {
                                return { target: c, value: { marker: { color: scales.color(c) } } };
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
        rows: numCols.length,
        cols: catCols.length > 0 ? catCols.length : 1,
        errorMessage: 'To create a Strip plot, please select at least 1 numerical column',
    };
}
//# sourceMappingURL=utils.js.map