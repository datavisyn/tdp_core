import {merge} from 'lodash';
import {VisCategoricalColumn, ColumnInfo, EColumnTypes, ESupportedPlotlyVis, IVisConfig, VisNumericalColumn, Scales, VisColumn} from '../interfaces';
import {PlotlyInfo, PlotlyData} from '../interfaces';
import {resolveColumnValues} from '../layoutUtils';

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
    columns: VisColumn[],
    config: IStripConfig,
): IVisConfig {
    const merged = merge({}, defaultConfig, config);

    const numCols = columns.filter((c) => c.type === EColumnTypes.NUMERICAL);

    if(merged.numColumnsSelected.length === 0 && numCols.length > 0) {
        merged.numColumnsSelected.push(numCols[numCols.length - 1].info);
    }

    return merged;
}

export async function createStripTraces(
    columns: VisColumn[],
    config: IStripConfig,
    scales: Scales,
): Promise<PlotlyInfo> {
    let plotCounter = 1;

    if(!config.numColumnsSelected || !config.catColumnsSelected) {
        return {
            plots: [],
            legendPlots: [],
            rows: 0,
            cols: 0,
            errorMessage: 'To create a Strip plot, please select at least 1 numerical column.',
        };
    }

    const _numCols: VisNumericalColumn[] = columns.filter((c) => config.numColumnsSelected.some((d) => c.info.id === d.id) && c.type === EColumnTypes.NUMERICAL) as VisNumericalColumn[];
    const _catCols: VisCategoricalColumn[] = columns.filter((c) => config.catColumnsSelected.some((d) => c.info.id === d.id) && c.type === EColumnTypes.CATEGORICAL) as VisCategoricalColumn[];
    const plots: PlotlyData[] = [];

    const numColValues = await resolveColumnValues(_numCols);
    const catColValues = await resolveColumnValues(_catCols);


    // if we only have numerical columns, add them individually
    if(catColValues.length === 0) {
        for(const numCurr of numColValues) {
            plots.push( {
                    data: {
                        y: numCurr.resolvedValues.map((v) => v.val),
                        xaxis: plotCounter === 1 ? 'x' : 'x' + plotCounter,
                        yaxis: plotCounter === 1 ? 'y' : 'y' + plotCounter,
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
            plotCounter += 1;
        }
    }

    for (const numCurr of numColValues) {
        for (const catCurr of catColValues) {
            plots.push({
                data: {
                    x: catCurr.resolvedValues.map((v) => v.val),
                    y: numCurr.resolvedValues.map((v) => v.val),
                    xaxis: plotCounter === 1 ? 'x' : 'x' + plotCounter,
                    yaxis: plotCounter === 1 ? 'y' : 'y' + plotCounter,
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
                        groups: catCurr.resolvedValues.map((v) => v.val),
                        styles:
                            [...new Set<string>(catCurr.resolvedValues.map((v) => v.val) as string[])].map((c) => {
                                return {target: c, value: {marker: {color: scales.color(c)}}};
                            })
                    }]
                },
                xLabel: catCurr.info.name,
                yLabel: numCurr.info.name
            });
            plotCounter += 1;
        }
    }

    return {
        plots,
        legendPlots: [],
        rows: numColValues.length,
        cols: catColValues.length > 0 ? catColValues.length : 1,
        errorMessage: 'To create a Strip plot, please select at least 1 numerical column',
    };
}
