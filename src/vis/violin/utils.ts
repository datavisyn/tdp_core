import {merge} from 'lodash';
import {CategoricalColumn, ColumnInfo, EColumnTypes, ESupportedPlotlyVis, IVisConfig, NumericalColumn, Scales} from '../interfaces';
import {PlotlyInfo, PlotlyData} from '../interfaces';
import {EViolinOverlay} from '../bar/utils';

export function isViolin(s: IVisConfig): s is IViolinConfig {
    return s.type === ESupportedPlotlyVis.VIOLIN;
}

export interface IViolinConfig {
    type: ESupportedPlotlyVis.VIOLIN;
    numColumnsSelected: ColumnInfo[];
    catColumnsSelected: ColumnInfo[];
    violinOverlay: EViolinOverlay;
}

const defaultConfig: IViolinConfig = {
    type: ESupportedPlotlyVis.VIOLIN,
    numColumnsSelected: [],
    catColumnsSelected: [],
    violinOverlay: EViolinOverlay.NONE,
};

export function violinMergeDefaultConfig(
    columns: (NumericalColumn | CategoricalColumn)[],
    config: IViolinConfig,
): IVisConfig {
    const merged = merge({}, defaultConfig, config);

    const numCols = columns.filter((c) => c.type === EColumnTypes.NUMERICAL);

    if(merged.numColumnsSelected.length === 0 && numCols.length > 0) {
        merged.numColumnsSelected.push(numCols[numCols.length - 1].info);
    }

    return merged;
}

export function createViolinTraces(
    columns: (NumericalColumn | CategoricalColumn)[],
    config: IViolinConfig,
    scales: Scales,
): PlotlyInfo {
    let counter = 1;

    if(!config.numColumnsSelected || !config.catColumnsSelected) {
        return {
            plots: [],
            legendPlots: [],
            rows: 0,
            cols: 0,
            errorMessage: 'To create a Violin plot, please select at least 1 numerical column.',
            formList: ['violinOverlay']
        };
    }

    const numCols: NumericalColumn[] = columns.filter((c) => config.numColumnsSelected.filter((d) => c.info.id === d.id).length > 0 && EColumnTypes.NUMERICAL) as NumericalColumn[];
    const catCols: CategoricalColumn[] = columns.filter((c) => config.catColumnsSelected.filter((d) => c.info.id === d.id).length > 0 && EColumnTypes.CATEGORICAL) as CategoricalColumn[];
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
                        points: config.violinOverlay === EViolinOverlay.STRIP ? 'all' : false,
                        box: {
                            visible: config.violinOverlay === EViolinOverlay.BOX ? true : false
                        },
                        meanline: {
                            visible: true
                        },
                        name: `${numCurr.info.name}`,
                        hoverinfo: 'y',
                        scalemode: 'width',
                        showlegend: false,
                    },
                    xLabel: numCurr.info.name,
                    yLabel: numCurr.info.name
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
                        name: `${catCurr.info.name} + ${numCurr.info.name}`,
                        scalemode: 'width',
                        pointpos: 0,
                        jitter: .3,
                        points: config.violinOverlay === EViolinOverlay.STRIP ? 'all' : false,
                        box: {
                            visible: config.violinOverlay === EViolinOverlay.BOX ? true : false
                        },
                        showlegend: false,
                        transforms: [{
                            type: 'groupby',
                            groups: catCurr.vals.map((v) => v.val),
                            styles:
                                [...new Set<string>(catCurr.vals.map((v) => v.val) as string[])].map((c) => {
                                    return {target: c, value: {line: {color: scales.color(c)}}};
                                })
                            }]
                    },
                    xLabel: catCurr.info.name,
                    yLabel: numCurr.info.name
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
        errorMessage: 'To create a Violin plot, please select at least 1 numerical column.',
        formList: ['violinOverlay']

    };
}

