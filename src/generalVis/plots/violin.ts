import {AllDropdownOptions, CategoricalColumn, EColumnTypes, NumericalColumn} from '../types/generalTypes';
import {GeneralPlot} from '../types/generalPlotInterface';
import {PlotlyInfo, PlotlyData, GeneralHomeProps} from '../types/generalTypes';
import {createSecureServer} from 'http2';
import {EViolinOverlay} from './bar';

export class PlotlyViolin implements GeneralPlot {
    startingHeuristic(props: GeneralHomeProps, selectedCatCols: string[], selectedNumCols: string[], updateSelectedCatCols: (s: string[]) => void, updateSelectedNumCols: (s: string[]) => void) {
        const numCols = props.columns.filter((c) => c.type === EColumnTypes.NUMERICAL);

        if(selectedNumCols.length === 0 && numCols.length >= 1) {
            updateSelectedNumCols([numCols[0].name]);
        }
    }

    createTraces(props: GeneralHomeProps, dropdownOptions: AllDropdownOptions, selectedCatCols: string[], selectedNumCols: string[]): PlotlyInfo {
        let counter = 1;
        const numCols: NumericalColumn[] = props.columns.filter((c) => selectedNumCols.includes(c.name) && EColumnTypes.NUMERICAL) as NumericalColumn[];
        const catCols: CategoricalColumn[] = props.columns.filter((c) => selectedCatCols.includes(c.name) && EColumnTypes.CATEGORICAL) as CategoricalColumn[];
        const plots: PlotlyData[] = [];

        if(catCols.length === 0) {
            for(const numCurr of numCols) {
                plots.push( {
                        data: {
                            y: numCurr.vals.map((v) => v.val),
                            xaxis: counter === 1 ? 'x' : 'x' + counter,
                            yaxis: counter === 1 ? 'y' : 'y' + counter,
                            type: 'violin',
                            pointpos: 0,
                            jitter: .3,
                            hoveron: 'violins',
                            points: dropdownOptions.violinOverlay.currentSelected === EViolinOverlay.STRIP ? 'all' : false,
                            box: {
                                visible: dropdownOptions.violinOverlay.currentSelected === EViolinOverlay.BOX ? true : false
                            },
                            meanline: {
                                visible: true
                            },
                            name: `${numCurr.name}`,
                            hoverinfo: 'y',
                            scalemode: 'width',
                            showlegend: false,
                        },
                        xLabel: numCurr.name,
                        yLabel: numCurr.name
                    },
                );
                counter += 1;
            }
        }

        for(const numCurr of numCols) {
            for(const catCurr of catCols) {
                plots.push( {
                        data: {
                            x: catCurr.vals.map((v) => v.val),
                            y: numCurr.vals.map((v) => v.val),
                            xaxis: counter === 1 ? 'x' : 'x' + counter,
                            yaxis: counter === 1 ? 'y' : 'y' + counter,
                            type: 'violin',
                            hoveron: 'violins',
                            hoverinfo: 'y',
                            meanline: {
                                visible: true
                            },
                            name: `${catCurr.name} + ${numCurr.name}`,
                            scalemode: 'width',
                            pointpos: 0,
                            jitter: .3,
                            points: dropdownOptions.violinOverlay.currentSelected === EViolinOverlay.STRIP ? 'all' : false,
                            box: {
                                visible: dropdownOptions.violinOverlay.currentSelected === EViolinOverlay.BOX ? true : false
                            },
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
            cols: catCols.length > 0 ? catCols.length : 1,
            errorMessage: 'To create a Violin plot, please select at least 1 categorical column and at least 1 numerical column.',
            formList: ['violinOverlay']

        };
    }
}
