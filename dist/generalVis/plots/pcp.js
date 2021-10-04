import d3 from 'd3';
import { EColumnTypes } from '../types/generalTypes';
export class PlotlyPCP {
    startingHeuristic(props, selectedCatCols, selectedNumCols, updateSelectedCatCols, updateSelectedNumCols) {
        return null;
    }
    createTraces(props, dropdownOptions, selectedCatCols, selectedNumCols) {
        const numCols = props.columns.filter((c) => selectedNumCols.filter((d) => c.info.id === d.id).length > 0 && EColumnTypes.NUMERICAL);
        const catCols = props.columns.filter((c) => selectedNumCols.filter((d) => c.info.id === d.id).length > 0 && EColumnTypes.CATEGORICAL);
        if (numCols.length + catCols.length < 2) {
            return {
                plots: [],
                legendPlots: [],
                rows: 0,
                cols: 0,
                errorMessage: 'To create a Parallel Coordinates plot, please select at least 2 columns.',
                formList: []
            };
        }
        const plot = {
            xLabel: null,
            yLabel: null,
            //yo why does this error i dunno but it works
            data: { dimensions: [...numCols.map((c) => {
                        return {
                            range: [d3.min(c.vals.map((v) => v.val)), d3.max(c.vals.map((v) => v.val))],
                            label: c.info.name,
                            values: c.vals.map((v) => v.val)
                        };
                    }), ...catCols.map((c) => {
                        const uniqueList = [...new Set(c.vals.map((v) => v.val))];
                        return {
                            range: [0, uniqueList.length - 1],
                            label: c.info.name,
                            values: c.vals.map((curr) => uniqueList.indexOf(curr.val)),
                            tickvals: [...uniqueList.keys()],
                            ticktext: uniqueList
                        };
                    })], type: 'parcoords',
                line: {
                    shape: 'spline',
                    opacity: .2
                }, }
        };
        return {
            plots: [plot],
            legendPlots: [],
            rows: 1,
            cols: 1,
            errorMessage: 'To create a Parallel Coordinates plot, please select at least 2 columns.',
            formList: []
        };
    }
}
//# sourceMappingURL=pcp.js.map