import {CategoricalColumn, NumericalColumn} from './CustomVis';
import {GeneralPlot} from './GeneralPlot';
import {MultipleDataTraces, MultiplesPlot, MultiplesProps} from './Multiples';

function heuristic(columns) {
    return {
        xAxis: columns.filter((c) => c.type === 'Categorical')[0].name,
        yAxis: columns.filter((c) => c.type === 'Numerical')[0].name
    };
}

export class PlotlyStrip extends GeneralPlot {
    startingHeuristic(props: MultiplesProps, selectedCatCols: string[], selectedNumCols: string[], updateSelectedCatCols: (s: string[]) => void, updateSelectedNumCols: (s: string[]) => void) {
        const numCols = props.columns.filter((c) => c.type === 'number');
        const catCols = props.columns.filter((c) => c.type === 'categorical');

        if (selectedNumCols.length === 0 && numCols.length >= 1) {
            updateSelectedNumCols([numCols[0].name]);
        }

        if (selectedCatCols.length === 0 && catCols.length >= 1) {
            updateSelectedCatCols([catCols[0].name]);
        }
    }

    createTrace(props: MultiplesProps, selectedCatCols: string[], selectedNumCols: string[], shapeScale, colorScale, opacityScale, bubbleScale): MultipleDataTraces {
        let counter = 1;
        const numCols: NumericalColumn[] = props.columns.filter((c) => selectedNumCols.includes(c.name) && c.type === 'number') as NumericalColumn[];
        const catCols: CategoricalColumn[] = props.columns.filter((c) => selectedCatCols.includes(c.name) && c.type === 'categorical') as CategoricalColumn[];
        const plots: MultiplesPlot[] = [];

        for (const numCurr of numCols) {
            for (const catCurr of catCols) {
                plots.push({
                    data: {
                        x: catCurr.vals.map((v) => v.val),
                        y: numCurr.vals.map((v) => v.val),
                        xaxis: counter === 1 ? 'x' : 'x' + counter,
                        yaxis: counter === 1 ? 'y' : 'y' + counter,
                        showlegend: false,
                        type: 'box',
                        boxpoints: 'all',
                        name: 'All points',
                        mode: 'none',
                        pointpos: 0,
                        box: {
                            visible: true
                        },
                        line: {
                            color: 'rgba(255,255,255,0)',
                        },
                        meanline: {
                            visible: true
                        },
                        transforms: [{
                            type: 'groupby',
                            groups: catCurr.vals.map((v) => v.val),
                            styles:
                                [...new Set<string>(catCurr.vals.map((v) => v.val) as string[])].map((c) => {
                                    return {target: c, value: {marker: {color: colorScale(c)}}};
                                })
                        }]
                    },
                    xLabel: catCurr.name,
                    yLabel: numCurr.name
                });
                counter += 1;
            }
        }

        return {
            plots,
            legendPlots: [],
            rows: numCols.length,
            cols: catCols.length,
            errorMessage: 'To create a Strip plot, please select at least 1 categorical column and at least 1 numerical column.'
        };
    }
}
