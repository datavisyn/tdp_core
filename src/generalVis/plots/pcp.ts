import d3 from 'd3';
import {AllDropdownOptions, CategoricalColumn, ColumnInfo, EColumnTypes, NumericalColumn} from '../types/generalTypes';
import {GeneralPlot} from '../types/generalPlotInterface';
import {PlotlyInfo, PlotlyData, GeneralHomeProps} from '../types/generalTypes';

export class PlotlyPCP implements GeneralPlot {
    startingHeuristic(props: GeneralHomeProps, selectedCatCols: ColumnInfo[], selectedNumCols: ColumnInfo[], updateSelectedCatCols: (s: ColumnInfo[]) => void, updateSelectedNumCols: (s: ColumnInfo[]) => void) {
        return null;
    }

    createTraces(props: GeneralHomeProps, dropdownOptions: AllDropdownOptions, selectedCatCols: ColumnInfo[], selectedNumCols: ColumnInfo[]): PlotlyInfo {
        const numCols: NumericalColumn[] = props.columns.filter((c) => selectedNumCols.filter((d) => c.info.id === d.id).length > 0 && EColumnTypes.NUMERICAL) as NumericalColumn[];
        const catCols: CategoricalColumn[] = props.columns.filter((c) => selectedNumCols.filter((d) => c.info.id === d.id).length > 0 && EColumnTypes.CATEGORICAL) as CategoricalColumn[];

        if(numCols.length + catCols.length < 2) {
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
            data: {dimensions: [...numCols.map((c) => {
                return {
                    range: [d3.min(c.vals.map((v) => v.val) as number[]), d3.max(c.vals.map((v) => v.val) as number[])],
                    label: c.info.name,
                    values: c.vals.map((v) => v.val)
                };
            }), ...catCols.map((c) => {

                const uniqueList = [...new Set<string>(c.vals.map((v) => v.val) as string[])];

                return {
                    range: [0, uniqueList.length - 1],
                    label: c.info.name,
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
            formList: []
        };
    }
}
