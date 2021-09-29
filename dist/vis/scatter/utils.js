import { EColumnTypes, ESupportedPlotlyVis } from '../interfaces';
import { getCol } from '../sidebar/utils';
import { merge } from 'lodash';
import d3 from 'd3';
export var ENumericalColorScaleType;
(function (ENumericalColorScaleType) {
    ENumericalColorScaleType["SEQUENTIAL"] = "Sequential";
    ENumericalColorScaleType["DIVERGENT"] = "Divergent";
})(ENumericalColorScaleType || (ENumericalColorScaleType = {}));
export function isScatter(s) {
    return s.type === ESupportedPlotlyVis.SCATTER;
}
const defaultConfig = {
    type: ESupportedPlotlyVis.SCATTER,
    numColumnsSelected: [],
    color: null,
    numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
    shape: null,
    isRectBrush: true,
    alphaSliderVal: 1
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
const emptyVal = {
    plots: [],
    legendPlots: [],
    rows: 0,
    cols: 0,
    errorMessage: 'To create a Scatterplot, please select at least 2 numerical columns.',
    formList: ['color', 'shape', 'bubble', 'opacity']
};
export function createScatterTraces(columns, selected, config, scales, shapes) {
    let counter = 1;
    if (!config.numColumnsSelected) {
        return emptyVal;
    }
    const validCols = config.numColumnsSelected.map((c) => columns.filter((col) => col.type === EColumnTypes.NUMERICAL && col.info.id === c.id)[0]);
    const plots = [];
    const shapeScale = config.shape ?
        d3.scale.ordinal().domain([...new Set(getCol(columns, config.shape).vals.map((v) => v.val))]).range(shapes)
        : null;
    let min = 0;
    let max = 0;
    if (config.color) {
        min = d3.min(getCol(columns, config.color).vals.map((v) => +v.val).filter((v) => v !== null)),
            max = d3.max(getCol(columns, config.color).vals.map((v) => +v.val).filter((v) => v !== null));
    }
    const numericalColorScale = config.color ?
        d3.scale.linear()
            .domain([max,
            (max + min) / 2,
            min])
            .range(config.numColorScaleType === ENumericalColorScaleType.SEQUENTIAL ? ['#002245', '#5c84af', '#cff6ff'] : ['#337ab7', '#d3d3d3', '#ec6836'])
        : null;
    const legendPlots = [];
    if (validCols.length === 1) {
        return emptyVal;
    }
    if (validCols.length === 2) {
        plots.push({
            data: {
                x: validCols[0].vals.map((v) => v.val),
                y: validCols[1].vals.map((v) => v.val),
                ids: validCols[0].vals.map((v) => v.id.toString()),
                xaxis: counter === 1 ? 'x' : 'x' + counter,
                yaxis: counter === 1 ? 'y' : 'y' + counter,
                type: 'scattergl',
                mode: 'markers',
                showlegend: false,
                text: validCols[0].vals.map((v) => v.id.toString()),
                marker: {
                    line: {
                        width: 0,
                    },
                    symbol: getCol(columns, config.shape) ? getCol(columns, config.shape).vals.map((v) => shapeScale(v.val)) : 'circle',
                    color: getCol(columns, config.color) ? getCol(columns, config.color).vals.map((v) => selected[v.id] ? '#E29609' : getCol(columns, config.color).type === EColumnTypes.NUMERICAL ? numericalColorScale(v.val) : scales.color(v.val)) : Object.values(selected).map((v) => v ? '#E29609' : '#2e2e2e'),
                    opacity: config.alphaSliderVal,
                    size: 10
                },
            },
            xLabel: validCols[0].info.name,
            yLabel: validCols[1].info.name
        });
    }
    else {
        for (const yCurr of validCols) {
            for (const xCurr of validCols) {
                plots.push({
                    data: {
                        x: xCurr.vals.map((v) => v.val),
                        y: yCurr.vals.map((v) => v.val),
                        ids: xCurr.vals.map((v) => v.id.toString()),
                        xaxis: counter === 1 ? 'x' : 'x' + counter,
                        yaxis: counter === 1 ? 'y' : 'y' + counter,
                        type: 'scattergl',
                        mode: 'markers',
                        hoverlabel: {
                            namelength: 5
                        },
                        showlegend: false,
                        text: validCols[0].vals.map((v) => v.id.toString()),
                        marker: {
                            line: {
                                width: 0,
                            },
                            symbol: getCol(columns, config.shape) ? getCol(columns, config.shape).vals.map((v) => shapeScale(v.val)) : 'circle',
                            color: getCol(columns, config.color) ? getCol(columns, config.color).vals.map((v) => selected[v.id] ? '#E29609' : getCol(columns, config.color).type === EColumnTypes.NUMERICAL ? numericalColorScale(v.val) : scales.color(v.val)) : Object.values(selected).map((v) => v ? '#E29609' : '#2e2e2e'),
                            opacity: config.alphaSliderVal,
                            size: 10
                        },
                    },
                    xLabel: xCurr.info.name,
                    yLabel: yCurr.info.name
                });
                counter += 1;
            }
        }
    }
    // if (dropdownOptions.color.currentColumn && validCols.length > 0) {
    //     legendPlots.push({
    //         data: {
    //             x: validCols[0].vals.map((v) => v.val),
    //             y: validCols[0].vals.map((v) => v.val),
    //             ids: validCols[0].vals.map((v) => v.id),
    //             xaxis: 'x',
    //             yaxis: 'y',
    //             type: 'scattergl',
    //             mode: 'markers',
    //             visible: 'legendonly',
    //             legendgroup: 'color',
    //             legendgrouptitle: {
    //                 text: 'Color'
    //             },
    //             marker: {
    //                 line: {
    //                     width: 0
    //                 },
    //                 symbol: 'circle',
    //                 size: 10,
    //                 color: dropdownOptions.color.currentColumn ? (dropdownOptions.color.currentColumn as any).vals.map((v) => dropdownOptions.color.scale(v.val)) : '#2e2e2e',
    //                 opacity: .5
    //             },
    //             transforms: [{
    //                 type: 'groupby',
    //                 groups: (dropdownOptions.color.currentColumn as any).vals.map((v) => v.val),
    //                 styles:
    //                     [...[...new Set<string>((dropdownOptions.color.currentColumn as any).vals.map((v) => v.val) as string[])].map((c) => {
    //                         return {target: c, value: {name: c}};
    //                     })]
    //             }]
    //         },
    //         xLabel: validCols[0].info.name,
    //         yLabel: validCols[0].info.name
    //     } as any);
    // }
    if (getCol(columns, config.shape)) {
        legendPlots.push({
            data: {
                x: validCols[0].vals.map((v) => v.val),
                y: validCols[0].vals.map((v) => v.val),
                ids: validCols[0].vals.map((v) => v.id),
                xaxis: 'x',
                yaxis: 'y',
                type: 'scattergl',
                mode: 'markers',
                visible: 'legendonly',
                showlegend: true,
                legendgroup: 'shape',
                legendgrouptitle: {
                    text: 'Shape'
                },
                marker: {
                    line: {
                        width: 0
                    },
                    opacity: config.alphaSliderVal,
                    size: 10,
                    symbol: getCol(columns, config.shape) ? getCol(columns, config.shape).vals.map((v) => shapeScale(v.val)) : 'circle',
                    color: '#2e2e2e'
                },
                transforms: [{
                        type: 'groupby',
                        groups: getCol(columns, config.shape).vals.map((v) => v.val),
                        styles: [...[...new Set(getCol(columns, config.shape).vals.map((v) => v.val))].map((c) => {
                                return { target: c, value: { name: c } };
                            })]
                    }]
            },
            xLabel: validCols[0].info.name,
            yLabel: validCols[0].info.name
        });
    }
    return {
        plots,
        legendPlots,
        rows: Math.sqrt(plots.length),
        cols: Math.sqrt(plots.length),
        errorMessage: 'To create a Scatterplot, please select at least 2 numerical columns.',
        formList: ['color', 'shape', 'filter', 'numericalColorScaleType']
    };
}
//# sourceMappingURL=utils.js.map