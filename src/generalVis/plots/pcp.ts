import d3 from 'd3';
import {AllDropdownOptions, CategoricalColumn, EColumnTypes, NumericalColumn} from '../types/generalTypes';
import {GeneralPlot} from '../types/generalPlotInterface';
import {PlotlyInfo, PlotlyData, GeneralHomeProps} from '../types/generalTypes';

export class PlotlyPCP implements GeneralPlot {
    startingHeuristic(props: GeneralHomeProps, selectedCatCols: string[], selectedNumCols: string[], updateSelectedCatCols: (s: string[]) => void, updateSelectedNumCols: (s: string[]) => void) {
        return null;
    }

    createTraces(props: GeneralHomeProps, dropdownOptions: AllDropdownOptions, selectedCatCols: string[], selectedNumCols: string[]): PlotlyInfo {
        const numCols: NumericalColumn[] = props.columns.filter((c) => selectedNumCols.includes(c.name) && EColumnTypes.NUMERICAL) as NumericalColumn[];
        const catCols: CategoricalColumn[] = props.columns.filter((c) => selectedCatCols.includes(c.name) && EColumnTypes.CATEGORICAL) as CategoricalColumn[];

        if(numCols.length + catCols.length < 2) {
            return {
                plots: [],
                legendPlots: [],
                rows: 0,
                cols: 0,
                errorMessage: 'To create a Parallel Coordinates plot, please select at least 2 columns.',
                dropdownList: []
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
            plots: [plot as PlotlyData],
            legendPlots: [],
            rows: 1,
            cols: 1,
            errorMessage: 'To create a Parallel Coordinates plot, please select at least 2 columns.',
            dropdownList: []
        };
    }
}
