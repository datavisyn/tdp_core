import { merge } from 'lodash';
import d3 from 'd3v3';
import { EColumnTypes, ESupportedPlotlyVis, ENumericalColorScaleType, EScatterSelectSettings, } from '../interfaces';
import { getCol } from '../sidebar';
import { getCssValue } from '../../utils';
import { resolveColumnValues, resolveSingleColumn } from '../general/layoutUtils';
import { I18nextManager } from '../../i18n';
export function isScatter(s) {
    return s.type === ESupportedPlotlyVis.SCATTER;
}
const defaultConfig = {
    type: ESupportedPlotlyVis.SCATTER,
    numColumnsSelected: [],
    color: null,
    numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
    shape: null,
    dragMode: EScatterSelectSettings.RECTANGLE,
    alphaSliderVal: 0.5,
};
export function scatterMergeDefaultConfig(columns, config) {
    const merged = merge({}, defaultConfig, config);
    const numCols = columns.filter((c) => c.type === EColumnTypes.NUMERICAL);
    if (merged.numColumnsSelected.length === 0 && numCols.length > 1) {
        merged.numColumnsSelected.push(numCols[numCols.length - 1].info);
        merged.numColumnsSelected.push(numCols[numCols.length - 2].info);
    }
    else if (merged.numColumnsSelected.length === 1 && numCols.length > 1) {
        if (numCols[numCols.length - 1].info.id !== merged.numColumnsSelected[0].id) {
            merged.numColumnsSelected.push(numCols[numCols.length - 1].info);
        }
        else {
            merged.numColumnsSelected.push(numCols[numCols.length - 2].info);
        }
    }
    return merged;
}
export function moveSelectedToFront(col, selectedMap) {
    const selectedVals = col.filter((v) => selectedMap[v.id]);
    const remainingVals = col.filter((v) => !selectedMap[v.id]);
    const sortedCol = [...remainingVals, ...selectedVals];
    return sortedCol;
}
export async function createScatterTraces(columns, selected, config, scales, shapes) {
    let plotCounter = 1;
    const emptyVal = {
        plots: [],
        legendPlots: [],
        rows: 0,
        cols: 0,
        errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.scatterError'),
        formList: ['color', 'shape', 'bubble', 'opacity'],
    };
    if (!config.numColumnsSelected) {
        return emptyVal;
    }
    const numCols = config.numColumnsSelected.map((c) => columns.find((col) => col.info.id === c.id));
    const plots = [];
    const validCols = await resolveColumnValues(numCols);
    const shapeCol = await resolveSingleColumn(getCol(columns, config.shape));
    const colorCol = await resolveSingleColumn(getCol(columns, config.color));
    validCols.forEach((c) => {
        c.resolvedValues = moveSelectedToFront(c.resolvedValues, selected);
    });
    const shapeScale = config.shape
        ? d3.scale
            .ordinal()
            .domain([...new Set(shapeCol.resolvedValues.map((v) => v.val))])
            .range(shapes)
        : null;
    let min = 0;
    let max = 0;
    if (config.color) {
        min = d3.min(colorCol.resolvedValues.map((v) => +v.val).filter((v) => v !== null));
        max = d3.max(colorCol.resolvedValues.map((v) => +v.val).filter((v) => v !== null));
    }
    const numericalColorScale = config.color
        ? d3.scale
            .linear()
            .domain([max, (max + min) / 2, min])
            .range(config.numColorScaleType === ENumericalColorScaleType.SEQUENTIAL
            ? [getCssValue('visyn-s9-blue'), getCssValue('visyn-s5-blue'), getCssValue('visyn-s1-blue')]
            : [getCssValue('visyn-c1'), '#d3d3d3', getCssValue('visyn-c2')])
        : null;
    const legendPlots = [];
    // cant currently do 1d scatterplots
    if (validCols.length === 1) {
        return emptyVal;
    }
    // if exactly 2 then return just one plot. otherwise, loop over and create n*n plots. TODO:: make the diagonal plots that have identical axis a histogram
    if (validCols.length === 2) {
        plots.push({
            data: {
                x: validCols[0].resolvedValues.map((v) => v.val),
                y: validCols[1].resolvedValues.map((v) => v.val),
                ids: validCols[0].resolvedValues.map((v) => v.id.toString()),
                xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
                yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
                type: 'scattergl',
                mode: 'markers',
                showlegend: false,
                text: validCols[0].resolvedValues.map((v) => v.id.toString()),
                marker: {
                    line: {
                        width: 0,
                    },
                    symbol: shapeCol ? shapeCol.resolvedValues.map((v) => shapeScale(v.val)) : 'circle',
                    color: colorCol
                        ? colorCol.resolvedValues.map((v) => selected[v.id] ? '#E29609' : colorCol.type === EColumnTypes.NUMERICAL ? numericalColorScale(v.val) : scales.color(v.val))
                        : validCols[0].resolvedValues.map((v) => (selected[v.id] ? '#E29609' : '#2e2e2e')),
                    opacity: validCols[0].resolvedValues.map((v) => (selected[v.id] ? 1 : config.alphaSliderVal)),
                    size: 10,
                },
            },
            xLabel: validCols[0].info.name,
            yLabel: validCols[1].info.name,
        });
    }
    else {
        for (const yCurr of validCols) {
            for (const xCurr of validCols) {
                // if on the diagonal, make a histogram.
                if (xCurr.info.id === yCurr.info.id) {
                    plots.push({
                        data: {
                            x: xCurr.resolvedValues.map((v) => v.val),
                            xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
                            yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
                            type: 'histogram',
                            hoverlabel: {
                                namelength: 5,
                            },
                            showlegend: false,
                            marker: {
                                color: '#2e2e2e',
                            },
                            opacity: config.alphaSliderVal,
                        },
                        xLabel: xCurr.info.name,
                        yLabel: yCurr.info.name,
                    });
                    // otherwise, make a scatterplot
                }
                else {
                    plots.push({
                        data: {
                            x: xCurr.resolvedValues.map((v) => v.val),
                            y: yCurr.resolvedValues.map((v) => v.val),
                            ids: xCurr.resolvedValues.map((v) => v.id.toString()),
                            xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
                            yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
                            type: 'scattergl',
                            mode: 'markers',
                            hoverlabel: {
                                namelength: 5,
                            },
                            showlegend: false,
                            text: validCols[0].resolvedValues.map((v) => v.id.toString()),
                            marker: {
                                line: {
                                    width: 0,
                                },
                                symbol: shapeCol ? shapeCol.resolvedValues.map((v) => shapeScale(v.val)) : 'circle',
                                color: colorCol
                                    ? colorCol.resolvedValues.map((v) => selected[v.id] ? '#E29609' : colorCol.type === EColumnTypes.NUMERICAL ? numericalColorScale(v.val) : scales.color(v.val))
                                    : xCurr.resolvedValues.map((v) => (selected[v.id] ? '#E29609' : '#2e2e2e')),
                                opacity: xCurr.resolvedValues.map((v) => (selected[v.id] ? 1 : config.alphaSliderVal)),
                                size: 10,
                            },
                        },
                        xLabel: xCurr.info.name,
                        yLabel: yCurr.info.name,
                    });
                }
                plotCounter += 1;
            }
        }
    }
    // if we have a column for the color, and its a categorical column, add a legendPlot that creates a legend.
    if (colorCol && colorCol.type === EColumnTypes.CATEGORICAL && validCols.length > 0) {
        legendPlots.push({
            data: {
                x: validCols[0].resolvedValues.map((v) => v.val),
                y: validCols[0].resolvedValues.map((v) => v.val),
                ids: validCols[0].resolvedValues.map((v) => v.id.toString()),
                xaxis: 'x',
                yaxis: 'y',
                type: 'scattergl',
                mode: 'markers',
                visible: 'legendonly',
                legendgroup: 'color',
                // @ts-ignore
                legendgrouptitle: {
                    text: 'Color',
                },
                marker: {
                    line: {
                        width: 0,
                    },
                    symbol: 'circle',
                    size: 10,
                    color: colorCol ? colorCol.resolvedValues.map((v) => scales.color(v.val)) : '#2e2e2e',
                    opacity: config.alphaSliderVal,
                },
                transforms: [
                    {
                        type: 'groupby',
                        groups: colorCol.resolvedValues.map((v) => v.val),
                        styles: [
                            ...[...new Set(colorCol.resolvedValues.map((v) => v.val))].map((c) => {
                                return { target: c, value: { name: c } };
                            }),
                        ],
                    },
                ],
            },
            xLabel: validCols[0].info.name,
            yLabel: validCols[0].info.name,
        });
    }
    // if we have a column for the shape, add a legendPlot that creates a legend.
    if (shapeCol) {
        legendPlots.push({
            data: {
                x: validCols[0].resolvedValues.map((v) => v.val),
                y: validCols[0].resolvedValues.map((v) => v.val),
                ids: validCols[0].resolvedValues.map((v) => v.id.toString()),
                xaxis: 'x',
                yaxis: 'y',
                type: 'scattergl',
                mode: 'markers',
                visible: 'legendonly',
                showlegend: true,
                legendgroup: 'shape',
                // @ts-ignore
                legendgrouptitle: {
                    text: 'Shape',
                },
                marker: {
                    line: {
                        width: 0,
                    },
                    opacity: config.alphaSliderVal,
                    size: 10,
                    symbol: shapeCol ? shapeCol.resolvedValues.map((v) => shapeScale(v.val)) : 'circle',
                    color: '#2e2e2e',
                },
                transforms: [
                    {
                        type: 'groupby',
                        groups: shapeCol.resolvedValues.map((v) => v.val),
                        styles: [
                            ...[...new Set(shapeCol.resolvedValues.map((v) => v.val))].map((c) => {
                                return { target: c, value: { name: c } };
                            }),
                        ],
                    },
                ],
            },
            xLabel: validCols[0].info.name,
            yLabel: validCols[0].info.name,
        });
    }
    return {
        plots,
        legendPlots,
        rows: Math.sqrt(plots.length),
        cols: Math.sqrt(plots.length),
        errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.scatterError'),
    };
}
//# sourceMappingURL=utils.js.map