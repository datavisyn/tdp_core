import d3 from 'd3';
import {CategoricalColumn, NumericalColumn} from './CustomVis';
import {GeneralPlot} from './GeneralPlot';
import {MultipleDataTraces, MultiplesPlot, MultiplesProps} from './Multiples';

function heuristic(columns) {
    return {
        xAxis: columns.filter((c) => c.type === 'Numerical')[0].name,
        yAxis: columns.filter((c) => c.type === 'Numerical')[1].name
    };
}

export class PlotlyPCP extends GeneralPlot {
    startingHeuristic(props: MultiplesProps, selectedCatCols: string[], selectedNumCols: string[], updateSelectedCatCols: (s: string[]) => void, updateSelectedNumCols: (s: string[]) => void) {
        return null;
    }

    createTrace(props: MultiplesProps, selectedCatCols: string[], selectedNumCols: string[], shapeScale, colorScale, opacityScale, bubbleScale): MultipleDataTraces {
        const numCols: NumericalColumn[] = props.columns.filter((c) => selectedNumCols.includes(c.name) && c.type === 'number') as NumericalColumn[];
        const catCols: CategoricalColumn[] = props.columns.filter((c) => selectedCatCols.includes(c.name) && c.type === 'categorical') as CategoricalColumn[];

        if(numCols.length + catCols.length < 2) {
            return {
                plots: [],
                legendPlots: [],
                rows: 0,
                cols: 0,
                errorMessage: 'To create a Parallel Coordinates plot, please select at least 2 columns.'
            };
        }

        const plot = {
            xLabel: null,
            yLabel: null,
            //yo why does this error i dunno but it works
            data: {dimensions: [...numCols.map((c) => {
                return {
                    range: [d3.min(c.vals.map((v) => v.val) as number[]), d3.max(c.vals.map((v) => v.val) as number[])],
                    label: c.name,
                    values: c.vals.map((v) => v.val)
                };
            }), ...catCols.map((c) => {

                const uniqueList = [...new Set<string>(c.vals.map((v) => v.val) as string[])];

                return {
                    range: [0, uniqueList.length - 1],
                    label: c.name,
                    values: c.vals.map((curr) => uniqueList.indexOf(curr.val)),
                    tickvals: [...uniqueList.keys()],
                    ticktext: uniqueList
                };
            })],
            type: 'parcoords',
            line: {
                shape: 'spline',
                opacity: .2
              },
            }
        };

        return {
            plots: [plot as MultiplesPlot],
            legendPlots: [],
            rows: 1,
            cols: 1,
            errorMessage: 'To create a Parallel Coordinates plot, please select at least 2 columns.'
        };
    }

}
