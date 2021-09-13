import { EColumnTypes } from '../types/generalTypes';
export class PlotlyViolin {
    startingHeuristic(props, selectedCatCols, selectedNumCols, updateSelectedCatCols, updateSelectedNumCols) {
        const numCols = props.columns.filter((c) => c.type === EColumnTypes.NUMERICAL);
        const catCols = props.columns.filter((c) => c.type === EColumnTypes.CATEGORICAL);
        if (selectedNumCols.length === 0 && numCols.length >= 1) {
            updateSelectedNumCols([numCols[0].name]);
        }
        if (selectedCatCols.length === 0 && catCols.length >= 1) {
            updateSelectedCatCols([catCols[0].name]);
        }
    }
    createTraces(props, dropdownOptions, selectedCatCols, selectedNumCols) {
        let counter = 1;
        const numCols = props.columns.filter((c) => selectedNumCols.includes(c.name) && EColumnTypes.NUMERICAL);
        const catCols = props.columns.filter((c) => selectedCatCols.includes(c.name) && EColumnTypes.CATEGORICAL);
        const plots = [];
        for (const numCurr of numCols) {
            for (const catCurr of catCols) {
                plots.push({
                    data: {
                        x: catCurr.vals.map((v) => v.val),
                        y: numCurr.vals.map((v) => v.val),
                        xaxis: counter === 1 ? 'x' : 'x' + counter,
                        yaxis: counter === 1 ? 'y' : 'y' + counter,
                        type: 'violin',
                        name: `All points ${catCurr.name} ${numCurr.name}`,
                        scalemode: 'width',
                        showlegend: false,
                        transforms: [{
                                type: 'groupby',
                                groups: catCurr.vals.map((v) => v.val),
                                styles: [...new Set(catCurr.vals.map((v) => v.val))].map((c) => {
                                    return { target: c, value: { line: { color: dropdownOptions.color.scale(c) } } };
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
            errorMessage: 'To create a Violin plot, please select at least 1 categorical column and at least 1 numerical column.',
            dropdownList: []
        };
    }
}
//# sourceMappingURL=violin.js.map