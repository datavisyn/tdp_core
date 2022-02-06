import { EColumnTypes } from '../types/generalTypes';
export var ENumericalColorScaleType;
(function (ENumericalColorScaleType) {
    ENumericalColorScaleType["SEQUENTIAL"] = "Sequential";
    ENumericalColorScaleType["DIVERGENT"] = "Divergent";
})(ENumericalColorScaleType || (ENumericalColorScaleType = {}));
export class PlotlyScatter {
    startingHeuristic(props, selectedCatCols, selectedNumCols, updateSelectedCatCols, updateSelectedNumCols) {
        const numCols = props.columns.filter((c) => c.type === EColumnTypes.NUMERICAL);
        if (selectedNumCols.length < 2 && numCols.length >= 2) {
            if (selectedNumCols.length === 0) {
                updateSelectedNumCols(numCols.slice(0, 2).map((c) => c.info));
            }
            else {
                updateSelectedNumCols([...selectedNumCols, numCols.filter((c) => selectedNumCols.filter((d) => c.info.id === d.id).length === 0)[0].info]);
            }
        }
    }
    createTraces(props, dropdownOptions, selectedCatCols, selectedNumCols) {
        let counter = 1;
        const validCols = props.columns.filter((c) => selectedNumCols.filter((d) => c.info.id === d.id).length > 0 && EColumnTypes.NUMERICAL);
        const plots = [];
        const legendPlots = [];
        if (validCols.length === 1) {
            return {
                plots: [],
                legendPlots: [],
                rows: 0,
                cols: 0,
                errorMessage: 'To create a Scatterplot, please select at least 2 numerical columns.',
                formList: ['color', 'shape', 'bubble', 'opacity']
            };
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
                        symbol: dropdownOptions.shape.currentColumn ? dropdownOptions.shape.currentColumn.vals.map((v) => dropdownOptions.shape.scale(v.val)) : 'circle',
                        color: dropdownOptions.color.currentColumn ? dropdownOptions.color.currentColumn.vals.map((v) => props.selected[v.id] ? '#E29609' : dropdownOptions.color.scale(v.val)) : Object.values(props.selected).map((v) => v ? '#E29609' : '#2e2e2e'),
                        opacity: dropdownOptions.opacity.currentColumn ? dropdownOptions.opacity.currentColumn.vals.map((v) => dropdownOptions.opacity.scale(v.val)) : dropdownOptions.alphaSlider.currentSelected,
                        size: dropdownOptions.bubble.currentColumn ? dropdownOptions.bubble.currentColumn.vals.map((v) => dropdownOptions.bubble.scale(v.val)) : 10
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
                                symbol: dropdownOptions.shape.currentColumn ? dropdownOptions.shape.currentColumn.vals.map((v) => dropdownOptions.shape.scale(v.val)) : 'circle',
                                color: dropdownOptions.color.currentColumn ? dropdownOptions.color.currentColumn.vals.map((v) => props.selected[v.id] ? '#E29609' : dropdownOptions.color.scale(v.val)) : Object.values(props.selected).map((v) => v ? '#E29609' : '#2e2e2e'),
                                opacity: dropdownOptions.opacity.currentColumn ? dropdownOptions.opacity.currentColumn.vals.map((v) => dropdownOptions.opacity.scale(v.val)) : dropdownOptions.alphaSlider.currentSelected,
                                size: dropdownOptions.bubble.currentColumn ? dropdownOptions.bubble.currentColumn.vals.map((v) => dropdownOptions.bubble.scale(v.val)) : 10
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
        if (dropdownOptions.shape.currentColumn) {
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
                        opacity: dropdownOptions.alphaSlider.currentSelected,
                        size: 10,
                        symbol: dropdownOptions.shape.currentColumn ? dropdownOptions.shape.currentColumn.vals.map((v) => dropdownOptions.shape.scale(v.val)) : 'circle',
                        color: '#2e2e2e'
                    },
                    transforms: [{
                            type: 'groupby',
                            groups: dropdownOptions.shape.currentColumn.vals.map((v) => v.val),
                            styles: [...[...new Set(dropdownOptions.shape.currentColumn.vals.map((v) => v.val))].map((c) => {
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
}
//# sourceMappingURL=scatter.js.map