import { GeneralPlot } from './GeneralPlot';
function heuristic(columns) {
    return {
        xAxis: columns.filter((c) => c.type === 'Categorical')[0].name,
        yAxis: columns.filter((c) => c.type === 'Numerical')[0].name
    };
}
export class PlotlyBox extends GeneralPlot {
    startingHeuristic(props, selectedCatCols, selectedNumCols, updateSelectedCatCols, updateSelectedNumCols) {
        const catCols = props.columns.filter((c) => c.type === 'categorical');
        if (selectedCatCols.length === 0 && catCols.length >= 1) {
            updateSelectedCatCols([catCols[0].name]);
        }
    }
    createTrace(props, selectedCatCols, selectedNumCols, shapeScale, colorScale, opacityScale, bubbleScale) {
        let counter = 1;
        const catCols = props.columns.filter((c) => selectedCatCols.includes(c.name) && c.type === 'categorical');
        const plots = [];
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
                            styles: [...new Set(catCurr.vals.map((v) => v.val))].map((c) => {
                                return { target: c, value: { marker: { color: colorScale(c) } } };
                            })
                        }]
                },
                xLabel: catCurr.name,
                yLabel: numCurr.name
            });
            counter += 1;
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
//# sourceMappingURL=PlotlyBoxplot.js.map