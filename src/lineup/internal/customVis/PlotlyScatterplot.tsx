import {GeneralPlot} from './GeneralPlot';
import {MultipleDataTraces, MultiplesPlot, MultiplesProps} from './Multiples';

export class PlotlyScatter extends GeneralPlot {

    startingHeuristic(props: MultiplesProps, selectedCatCols: string[], selectedNumCols: string[], updateSelectedCatCols: (s: string[]) => void, updateSelectedNumCols: (s: string[]) => void) {
        const numCols = props.columns.filter((c) => c.type === 'number');
        if (selectedNumCols.length < 2 && numCols.length >= 2) {
            if (selectedNumCols.length === 0) {
                updateSelectedNumCols(numCols.slice(0, 2).map((c) => c.name));
            } else {
                updateSelectedNumCols([...selectedNumCols, numCols.filter((c) => !selectedNumCols.includes(c.name))[0].name]);
            }
        }
    }

    createTrace(props: MultiplesProps, selectedCatCols: string[], selectedNumCols: string[], shapeScale, colorScale, opacityScale, bubbleScale): MultipleDataTraces {
        let counter = 1;
        const validCols = props.columns.filter((c) => selectedNumCols.includes(c.name));
        const plots: MultiplesPlot[] = [];

        const legendPlots: MultiplesPlot[] = [];

        if (validCols.length === 1) {
            return {
                plots: [],
                legendPlots: [],
                rows: 0,
                cols: 0,
                errorMessage: 'To create a Scatterplot, please select at least 2 numerical columns.'
            };
        }

        if (validCols.length === 2) {
            plots.push({
                data: {
                    x: validCols[0].vals.map((v) => v.val),
                    y: validCols[1].vals.map((v) => v.val),
                    ids: validCols[0].vals.map((v) => v.id),
                    xaxis: counter === 1 ? 'x' : 'x' + counter,
                    yaxis: counter === 1 ? 'y' : 'y' + counter,
                    type: 'scatter',
                    mode: 'markers',
                    showlegend: false,
                    text: validCols[0].vals.map((v) => v.id),
                    marker: {
                        line: {
                            width: props.color ? validCols[0].vals.map((v) => v.selected ? 3 : 0) : 0,
                            color: '#E29609',
                        },
                        symbol: props.shape ? props.shape.vals.map((v) => shapeScale(v.val)) : 'circle',
                        color: props.color ? props.color.vals.map((v) => colorScale(v.val)) : validCols[0].vals.map((v) => v.selected ? '#E29609' : '#2e2e2e'),
                        opacity: props.opacity ? props.opacity.vals.map((v) => opacityScale(v.val)) : .5,
                        size: props.bubbleSize ? props.bubbleSize.vals.map((v) => bubbleScale(v.val)) : 10
                    },
                },
                xLabel: validCols[0].name,
                yLabel: validCols[1].name
            });
        } else {
            for (const yCurr of validCols) {
                for (const xCurr of validCols) {
                    plots.push({
                        data: {
                            x: xCurr.vals.map((v) => v.val),
                            y: yCurr.vals.map((v) => v.val),
                            ids: xCurr.vals.map((v) => v.id),
                            xaxis: counter === 1 ? 'x' : 'x' + counter,
                            yaxis: counter === 1 ? 'y' : 'y' + counter,
                            type: 'scatter',
                            mode: 'markers',
                            showlegend: false,
                            text: validCols[0].vals.map((v) => v.id),
                            marker: {
                                line: {
                                    width: props.color ? xCurr.vals.map((v) => v.selected ? 3 : 0) : 0,
                                    color: '#E29609'
                                },
                                symbol: props.shape ? props.shape.vals.map((v) => shapeScale(v.val)) : 'circle',
                                color: props.color ? props.color.vals.map((v) => colorScale(v.val)) : validCols[0].vals.map((v) => v.selected ? '#E29609' : '#2e2e2e'),
                                opacity: props.opacity ? props.opacity.vals.map((v) => opacityScale(v.val)) : .5,
                                size: props.bubbleSize ? props.bubbleSize.vals.map((v) => bubbleScale(v.val)) : 10
                            },
                        },
                        xLabel: xCurr.name,
                        yLabel: yCurr.name
                    });

                    counter += 1;
                }
            }
        }

        if (props.color && validCols.length > 0) {
            legendPlots.push({
                data: {
                    x: validCols[0].vals.map((v) => v.val),
                    y: validCols[0].vals.map((v) => v.val),
                    ids: validCols[0].vals.map((v) => v.id),
                    xaxis: 'x',
                    yaxis: 'y',
                    type: 'scatter',
                    mode: 'markers',
                    visible: 'legendonly',
                    legendgroup: 'color',
                    legendgrouptitle: {
                        text: 'Color'
                    },
                    marker: {
                        line: {
                            width: 0
                        },
                        symbol: 'circle',
                        size: 10,
                        color: props.color ? props.color.vals.map((v) => colorScale(v.val)) : '#2e2e2e',
                        opacity: .5
                    },
                    transforms: [{
                        type: 'groupby',
                        groups: props.color.vals.map((v) => v.val),
                        styles:
                            [...[...new Set<string>(props.color.vals.map((v) => v.val) as string[])].map((c) => {
                                return {target: c, value: {name: c}};
                            })]
                    }]
                },
                xLabel: validCols[0].name,
                yLabel: validCols[0].name
            } as any);
        }

        if (props.shape) {
            legendPlots.push({
                data: {
                    x: validCols[0].vals.map((v) => v.val),
                    y: validCols[0].vals.map((v) => v.val),
                    ids: validCols[0].vals.map((v) => v.id),
                    xaxis: 'x',
                    yaxis: 'y',
                    type: 'scatter',
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
                        opacity: .5,
                        size: 10,
                        symbol: props.shape ? props.shape.vals.map((v) => shapeScale(v.val)) : 'circle',
                        color: '#2e2e2e'
                    },
                    transforms: [{
                        type: 'groupby',
                        groups: props.shape.vals.map((v) => v.val),
                        styles:
                            [...[...new Set<string>(props.shape.vals.map((v) => v.val) as string[])].map((c) => {
                                return {target: c, value: {name: c}};
                            })]
                    }]
                },
                xLabel: validCols[0].name,
                yLabel: validCols[0].name
            } as any);
        }

        return {
            plots,
            legendPlots,
            rows: Math.sqrt(plots.length),
            cols: Math.sqrt(plots.length),
            errorMessage: 'To create a Scatterplot, please select at least 2 numerical columns.'
        };
    }
}
