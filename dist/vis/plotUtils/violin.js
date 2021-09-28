import { merge } from 'lodash';
import { EColumnTypes, ESupportedPlotlyVis } from '../types/generalTypes';
import { EViolinOverlay } from './bar';
export function isViolin(s) {
    return s.type === ESupportedPlotlyVis.VIOLIN;
}
const defaultConfig = {
    type: ESupportedPlotlyVis.VIOLIN,
    numColumnsSelected: [],
    catColumnsSelected: [],
    violinOverlay: EViolinOverlay.NONE,
};
export function violinInit(columns, config) {
    const merged = merge(defaultConfig, config);
    const numCols = columns.filter((c) => c.type === EColumnTypes.NUMERICAL);
    if (merged.numColumnsSelected.length === 0 && numCols.length > 0) {
        merged.numColumnsSelected.push(numCols[numCols.length - 1].info);
    }
    return merged;
}
export function createViolinTraces(columns, config, scales) {
    let counter = 1;
    if (!config.numColumnsSelected || !config.catColumnsSelected) {
        return {
            plots: [],
            legendPlots: [],
            rows: 0,
            cols: 0,
            errorMessage: 'To create a Violin plot, please select at least 1 numerical column.',
            formList: ['violinOverlay']
        };
    }
    const numCols = columns.filter((c) => config.numColumnsSelected.filter((d) => c.info.id === d.id).length > 0 && EColumnTypes.NUMERICAL);
    const catCols = columns.filter((c) => config.catColumnsSelected.filter((d) => c.info.id === d.id).length > 0 && EColumnTypes.CATEGORICAL);
    const plots = [];
    if (catCols.length === 0) {
        for (const numCurr of numCols) {
            plots.push({
                data: {
                    y: numCurr.vals.map((v) => v.val),
                    xaxis: counter === 1 ? 'x' : 'x' + counter,
                    yaxis: counter === 1 ? 'y' : 'y' + counter,
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
            counter += 1;
        }
    }
    for (const numCurr of numCols) {
        for (const catCurr of catCols) {
            plots.push({
                data: {
                    x: catCurr.vals.map((v) => v.val),
                    y: numCurr.vals.map((v) => v.val),
                    xaxis: counter === 1 ? 'x' : 'x' + counter,
                    yaxis: counter === 1 ? 'y' : 'y' + counter,
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
                            groups: catCurr.vals.map((v) => v.val),
                            styles: [...new Set(catCurr.vals.map((v) => v.val))].map((c) => {
                                return { target: c, value: { line: { color: scales.color(c) } } };
                            })
                        }]
                },
                xLabel: catCurr.info.name,
                yLabel: numCurr.info.name
            });
            counter += 1;
        }
    }
    return {
        plots,
        legendPlots: [],
        rows: numCols.length,
        cols: catCols.length > 0 ? catCols.length : 1,
        errorMessage: 'To create a Violin plot, please select at least 1 numerical column.',
        formList: ['violinOverlay']
    };
}
//# sourceMappingURL=violin.js.map