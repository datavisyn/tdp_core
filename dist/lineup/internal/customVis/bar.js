import { GeneralPlot } from './generalPlotInterface';
function heuristic(columns) {
    return {
        xAxis: columns.filter((c) => c.type === 'Categorical')[0].name,
        yAxis: columns.filter((c) => c.type === 'Numerical')[0].name
    };
}
export class PlotlyBar extends GeneralPlot {
    startingHeuristic(props, selectedCatCols, selectedNumCols, updateSelectedCatCols, updateSelectedNumCols) {
        const catCols = props.columns.filter((c) => c.type === 'categorical');
        if (selectedCatCols.length === 0 && catCols.length >= 1) {
            updateSelectedCatCols([catCols[0].name]);
        }
    }
    createTrace(props, dropdownOptions, selectedCatCols, selectedNumCols) {
        let counter = 1;
        const catCols = props.columns.filter((c) => selectedCatCols.includes(c.name) && c.type === 'categorical');
        const vertFlag = dropdownOptions.barDirection.currentSelected === 'Vertical';
        const normalizedFlag = dropdownOptions.barNormalized.currentSelected === 'Normalized';
        const plots = [];
        if (catCols.length > 0) {
            const catCurr = catCols[0];
            if (dropdownOptions.groupBy.currentColumn) {
                const currColumn = dropdownOptions.groupBy.currentColumn;
                const uniqueGroupVals = [...new Set(currColumn.vals.map((v) => v.val))];
                const uniqueColVals = [...new Set(catCurr.vals.map((v) => v.val))];
                uniqueGroupVals.forEach((uniqueVal) => {
                    const groupedLength = uniqueColVals.map((v) => {
                        const allObjs = catCurr.vals.filter((c) => c.val === v).map((c) => c.id);
                        const allGroupObjs = currColumn.vals.filter((c) => c.val === uniqueVal).map((c) => c.id);
                        const singleObjs = allObjs.filter((c) => allGroupObjs.includes(c));
                        return normalizedFlag ? singleObjs.length / allObjs.length * 100 : singleObjs.length;
                    });
                    plots.push({
                        data: {
                            x: vertFlag ? [...new Set(catCurr.vals.map((v) => v.val))] : groupedLength,
                            y: !vertFlag ? [...new Set(catCurr.vals.map((v) => v.val))] : groupedLength,
                            orientation: vertFlag ? 'v' : 'h',
                            xaxis: counter === 1 ? 'x' : 'x' + counter,
                            yaxis: counter === 1 ? 'y' : 'y' + counter,
                            showlegend: counter === 1 ? true : false,
                            type: 'bar',
                            name: uniqueVal,
                            marker: {
                                color: dropdownOptions.color.scale(uniqueVal),
                            }
                        },
                        xLabel: catCurr.name,
                        yLabel: normalizedFlag ? 'Percent of Total' : 'Count'
                    });
                });
            }
            else {
                const count = [...new Set(catCurr.vals.map((v) => v.val))].map((curr) => catCurr.vals.filter((c) => c.val === curr).length);
                const valArr = [...new Set(catCurr.vals.map((v) => v.val))];
                plots.push({
                    data: {
                        x: vertFlag ? valArr : count,
                        y: !vertFlag ? valArr : count,
                        orientation: vertFlag ? 'v' : 'h',
                        xaxis: counter === 1 ? 'x' : 'x' + counter,
                        yaxis: counter === 1 ? 'y' : 'y' + counter,
                        type: 'bar',
                        name: catCurr.name
                    },
                    xLabel: catCurr.name,
                    yLabel: normalizedFlag ? 'Percent of Total' : 'Count'
                });
            }
            counter += 1;
        }
        return {
            plots,
            legendPlots: [],
            rows: catCols.length,
            cols: 1,
            errorMessage: 'To create a Strip plot, please select at least 1 categorical column and at least 1 numerical column.',
            dropdownList: ['Group', 'Small Multiples', 'Bar Direction', 'Bar Group By', 'Bar Normalized']
        };
    }
}
//# sourceMappingURL=bar.js.map