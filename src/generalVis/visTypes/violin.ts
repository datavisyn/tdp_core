import {AllDropdownOptions, CategoricalColumn, NumericalColumn} from '../types/generalTypes';
import {GeneralPlot} from '../types/generalPlotInterface';
import {PlotlyInfo, PlotlyData, GeneralHomeProps} from '../types/generalTypes';

export class PlotlyViolin implements GeneralPlot {
    startingHeuristic(props: GeneralHomeProps, selectedCatCols: string[], selectedNumCols: string[], updateSelectedCatCols: (s: string[]) => void, updateSelectedNumCols: (s: string[]) => void) {
        const numCols = props.columns.filter((c) => c.type === 'number');
        const catCols = props.columns.filter((c) => c.type === 'categorical');

        if(selectedNumCols.length === 0 && numCols.length >= 1) {
            updateSelectedNumCols([numCols[0].name]);
        }

        if(selectedCatCols.length === 0 && catCols.length >= 1) {
            updateSelectedCatCols([catCols[0].name]);
        }
    }

    createTraces(props: GeneralHomeProps, dropdownOptions: AllDropdownOptions, selectedCatCols: string[], selectedNumCols: string[]): PlotlyInfo {
        let counter = 1;
        const numCols: NumericalColumn[] = props.columns.filter((c) => selectedNumCols.includes(c.name) && c.type === 'number') as NumericalColumn[];
        const catCols: CategoricalColumn[] = props.columns.filter((c) => selectedCatCols.includes(c.name) && c.type === 'categorical') as CategoricalColumn[];
        const plots: PlotlyData[] = [];

        for(const numCurr of numCols) {
            for(const catCurr of catCols) {
                plots.push( {
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
                                styles:
                                    [...new Set<string>(catCurr.vals.map((v) => v.val) as string[])].map((c) => {
                                        return {target: c, value: {line: {color: dropdownOptions.color.scale(c)}}};
                                    })
                                }]
                        },
                        xLabel: catCurr.name,
                        yLabel: numCurr.name
                    },
                );
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
