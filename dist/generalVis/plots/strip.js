import { EColumnTypes } from '../types/generalTypes';
export class PlotlyStrip {
    startingHeuristic(props, selectedCatCols, selectedNumCols, updateSelectedCatCols, updateSelectedNumCols) {
        const numCols = props.columns.filter((c) => c.type === EColumnTypes.NUMERICAL);
        if (selectedNumCols.length === 0 && numCols.length >= 1) {
            updateSelectedNumCols([numCols[0].info]);
        }
    }
    createTraces(props, dropdownOptions, selectedCatCols, selectedNumCols) {
        let counter = 1;
        const numCols = props.columns.filter((c) => selectedNumCols.filter((d) => c.info.id === d.id).length > 0 && c.type === EColumnTypes.NUMERICAL);
        const catCols = props.columns.filter((c) => selectedCatCols.filter((d) => c.info.id === d.id).length > 0 && c.type === EColumnTypes.CATEGORICAL);
        const plots = [];
        console.log(catCols);
        if (catCols.length === 0) {
            for (const numCurr of numCols) {
                plots.push({
                    data: {
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
                        marker: {
                            color: '#337ab7'
                        }
                    },
                    xLabel: numCurr.info.name,
                    yLabel: numCurr.info.name,
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
                                    return { target: c, value: { marker: { color: dropdownOptions.color.scale(c) } } };
                                })
                            }]
                    },
                    xLabel: catCurr.info.name,
                    yLabel: numCurr.info.name
                });
                counter += 1;
            }
        }
        console.log(plots, numCols);
        return {
            plots,
            legendPlots: [],
            rows: numCols.length,
            cols: catCols.length > 0 ? catCols.length : 1,
            errorMessage: 'To create a Strip plot, please select at least 1 numerical column',
            formList: []
        };
    }
}
//# sourceMappingURL=strip.js.map