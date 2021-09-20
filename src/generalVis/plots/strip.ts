import {AllDropdownOptions, CategoricalColumn, ColumnInfo, EColumnTypes, NumericalColumn} from '../types/generalTypes';
import {GeneralPlot} from '../types/generalPlotInterface';
import {PlotlyInfo, PlotlyData, GeneralHomeProps} from '../types/generalTypes';

export class PlotlyStrip implements GeneralPlot {
    startingHeuristic(props: GeneralHomeProps, selectedCatCols: ColumnInfo[], selectedNumCols: ColumnInfo[], updateSelectedCatCols: (s: ColumnInfo[]) => void, updateSelectedNumCols: (s: ColumnInfo[]) => void) {
        const numCols = props.columns.filter((c) => EColumnTypes.NUMERICAL);
        const catCols = props.columns.filter((c) => EColumnTypes.CATEGORICAL);

        if (selectedNumCols.length === 0 && numCols.length >= 1) {
            updateSelectedNumCols([numCols[0].info]);
        }

        if (selectedCatCols.length === 0 && catCols.length >= 1) {
            updateSelectedCatCols([catCols[0].info]);
        }
    }

    createTraces(props: GeneralHomeProps, dropdownOptions: AllDropdownOptions, selectedCatCols: ColumnInfo[], selectedNumCols: ColumnInfo[]): PlotlyInfo {
        let counter = 1;
        const numCols: NumericalColumn[] = props.columns.filter((c) => selectedNumCols.filter((d) => c.info.id === d.id).length > 0 && c.type === EColumnTypes.NUMERICAL) as NumericalColumn[];
        const catCols: CategoricalColumn[] = props.columns.filter((c) => selectedCatCols.filter((d) => c.info.id === d.id).length > 0 && c.type === EColumnTypes.CATEGORICAL) as CategoricalColumn[];
        const plots: PlotlyData[] = [];

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
                            styles:
                                [...new Set<string>(catCurr.vals.map((v) => v.val) as string[])].map((c) => {
                                    return {target: c, value: {marker: {color: dropdownOptions.color.scale(c)}}};
                                })
                        }]
                    },
                    xLabel: catCurr.info.name,
                    yLabel: numCurr.info.name
                });
                counter += 1;
            }
        }

        return {
            plots,
            legendPlots: [],
            rows: numCols.length,
            cols: catCols.length,
            errorMessage: 'To create a Strip plot, please select at least 1 categorical column and at least 1 numerical column.',
            formList: []
        };
    }
}
