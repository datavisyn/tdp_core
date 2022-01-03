import { merge } from 'lodash';
import { EColumnTypes, ESupportedPlotlyVis } from '../interfaces';
import { EViolinOverlay } from '../bar/utils';
import { resolveColumnValues } from '../layoutUtils';
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
            errorMessage: 'To create a Violin plot, please select at least 1 numerical column.',
        };
    }
    const _numCols = columns.filter((c) => config.numColumnsSelected.some((d) => c.info.id === d.id) && c.type === EColumnTypes.NUMERICAL);
    const _catCols = columns.filter((c) => config.catColumnsSelected.some((d) => c.info.id === d.id) && c.type === EColumnTypes.CATEGORICAL);
    const plots = [];
    const numColValues = await resolveColumnValues(_numCols);
    const catColValues = await resolveColumnValues(_catCols);
    //if we onl have numerical columns, add them individually.
    if (catColValues.length === 0) {
        for (const numCurr of numColValues) {
            plots.push({
                data: {
                    y: numCurr.resolvedValues.map((v) => v.val),
                    xaxis: plotCounter === 1 ? 'x' : 'x' + plotCounter,
                    yaxis: plotCounter === 1 ? 'y' : 'y' + plotCounter,
                    type: 'violin',
                    pointpos: 0,
                    jitter: .3,
                    hoveron: 'violins',
                    points: config.violinOverlay === EViolinOverlay.STRIP ? 'all' : false,
                    box: {
                        visible: config.violinOverlay === EViolinOverlay.BOX ? true : false
                    },
                    meanline: {
                        visible: true
                    },
                    name: `${numCurr.info.name}`,
                    hoverinfo: 'y',
                    scalemode: 'width',
                    showlegend: false,
                },
                xLabel: numCurr.info.name,
                yLabel: numCurr.info.name
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
                    xaxis: plotCounter === 1 ? 'x' : 'x' + plotCounter,
                    yaxis: plotCounter === 1 ? 'y' : 'y' + plotCounter,
                    type: 'violin',
                    hoveron: 'violins',
                    hoverinfo: 'y',
                    meanline: {
                        visible: true
                    },
                    name: `${catCurr.info.name} + ${numCurr.info.name}`,
                    scalemode: 'width',
                    pointpos: 0,
                    jitter: .3,
                    points: config.violinOverlay === EViolinOverlay.STRIP ? 'all' : false,
                    box: {
                        visible: config.violinOverlay === EViolinOverlay.BOX ? true : false
                    },
                    showlegend: false,
                    transforms: [{
                            type: 'groupby',
                            groups: catCurr.resolvedValues.map((v) => v.val),
                            styles: [...new Set(catCurr.resolvedValues.map((v) => v.val))].map((c) => {
                                return { target: c, value: { line: { color: scales.color(c) } } };
                            })
                        }]
                },
                xLabel: catCurr.info.name,
                yLabel: numCurr.info.name
            });
            plotCounter += 1;
        }
    }
    return {
        plots,
        legendPlots: [],
        rows: numColValues.length,
        cols: catColValues.length > 0 ? catColValues.length : 1,
        errorMessage: 'To create a Violin plot, please select at least 1 numerical column.',
    };
}
//# sourceMappingURL=utils.js.map