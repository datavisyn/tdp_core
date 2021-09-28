import {merge} from 'lodash';
import {CategoricalColumn, ColumnInfo, EColumnTypes, ESupportedPlotlyVis, IVisConfig, NumericalColumn, Scales} from '../interfaces';
import {PlotlyInfo, PlotlyData} from '../interfaces';

export function isStrip(s: IVisConfig): s is IStripConfig {
    return s.type === ESupportedPlotlyVis.STRIP;
}

export interface IStripConfig {
    type: ESupportedPlotlyVis.STRIP;
    numColumnsSelected: ColumnInfo[];
    catColumnsSelected: ColumnInfo[];
}

const defaultConfig: IStripConfig = {
    type: ESupportedPlotlyVis.STRIP,
    numColumnsSelected: [],
    catColumnsSelected: [],
};

export function stripMergeDefaultConfig(
    columns: (NumericalColumn | CategoricalColumn)[],
    config: IStripConfig,
): IVisConfig {
    const merged = merge(defaultConfig, config);

    const numCols = columns.filter((c) => c.type === EColumnTypes.NUMERICAL);

    if(merged.numColumnsSelected.length === 0 && numCols.length > 0) {
        merged.numColumnsSelected.push(numCols[numCols.length - 1].info);
    }

    return merged;
}

export function createStripTraces(
    columns: (NumericalColumn | CategoricalColumn)[],
    config: IStripConfig,
    scales: Scales,
): PlotlyInfo {
    let counter = 1;

    if(!config.numColumnsSelected || !config.catColumnsSelected) {
        return {
            plots: [],
            legendPlots: [],
            rows: 0,
            cols: 0,
            errorMessage: 'To create a Strip plot, please select at least 1 numerical column.',
            formList: []
        };
    }

    const numCols: NumericalColumn[] = columns.filter((c) => config.numColumnsSelected.filter((d) => c.info.id === d.id).length > 0 && c.type === EColumnTypes.NUMERICAL) as NumericalColumn[];
    const catCols: CategoricalColumn[] = columns.filter((c) => config.catColumnsSelected.filter((d) => c.info.id === d.id).length > 0 && c.type === EColumnTypes.CATEGORICAL) as CategoricalColumn[];
    const plots: PlotlyData[] = [];

    console.log(catCols);

    if(catCols.length === 0) {
        for(const numCurr of numCols) {
            plots.push( {
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

                },
            );
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
                        styles:
                            [...new Set<string>(catCurr.vals.map((v) => v.val) as string[])].map((c) => {
                                return {target: c, value: {marker: {color: scales.color(c)}}};
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
