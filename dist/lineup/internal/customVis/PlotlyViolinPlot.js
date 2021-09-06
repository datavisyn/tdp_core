import { GeneralPlot } from './GeneralPlot';
function heuristic(columns) {
    return {
        xAxis: columns.filter(c => c.type === "Categorical")[0].name,
        yAxis: columns.filter(c => c.type === "Numerical")[0].name
    };
}
export class PlotlyViolin extends GeneralPlot {
    startingHeuristic(props, selectedCatCols, selectedNumCols, updateSelectedCatCols, updateSelectedNumCols) {
        let numCols = props.columns.filter(c => c.type === "number");
        let catCols = props.columns.filter(c => c.type === "categorical");
        if (selectedNumCols.length === 0 && numCols.length >= 1) {
            updateSelectedNumCols([numCols[0].name]);
        }
        if (selectedCatCols.length === 0 && catCols.length >= 1) {
            updateSelectedCatCols([catCols[0].name]);
        }
    }
    createTrace(props, selectedCatCols, selectedNumCols, shapeScale, colorScale, opacityScale, bubbleScale) {
        let counter = 1;
        let numCols = props.columns.filter(c => selectedNumCols.includes(c.name));
        let catCols = props.columns.filter(c => selectedCatCols.includes(c.name));
        let plots = [];
        for (let numCurr of numCols) {
            for (let catCurr of catCols) {
                plots.push({
                    data: {
                        x: catCurr.vals.map(v => v.val),
                        y: numCurr.vals.map(v => v.val),
                        xaxis: counter === 1 ? "x" : "x" + counter,
                        yaxis: counter === 1 ? "y" : "y" + counter,
                        type: 'violin',
                        name: `All points ${catCurr.name} ${numCurr.name}`,
                        scalemode: "width",
                        showlegend: false,
                        transforms: [{
                                type: 'groupby',
                                groups: catCurr.vals.map(v => v.val),
                                styles: [...new Set(catCurr.vals.map(v => v.val))].map(c => {
                                    return { target: c, value: { line: { color: colorScale(c) } } };
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
            plots: plots,
            legendPlots: [],
            rows: numCols.length,
            cols: catCols.length,
            errorMessage: "To create a Violin plot, please select at least 1 categorical column and at least 1 numerical column."
        };
    }
}
//# sourceMappingURL=PlotlyViolinPlot.js.map