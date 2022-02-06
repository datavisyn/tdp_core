import {merge} from 'lodash';
import {PlotlyInfo, PlotlyData, VisCategoricalColumn, ColumnInfo, EColumnTypes, ESupportedPlotlyVis, IVisConfig, VisNumericalColumn, Scales, VisColumn} from '../interfaces';
import {EViolinOverlay} from '../bar/utils';
import {resolveColumnValues} from '../general/layoutUtils';
import {I18nextManager} from '../../i18n';

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
    columns: VisColumn[],
    config: IViolinConfig,
): IVisConfig {
    const merged = merge({}, defaultConfig, config);

    const numCols = columns.filter((c) => c.type === EColumnTypes.NUMERICAL);

    if(merged.numColumnsSelected.length === 0 && numCols.length > 0) {
        merged.numColumnsSelected.push(numCols[numCols.length - 1].info);
    }

    return merged;
}

export async function createViolinTraces(
    columns: VisColumn[],
    config: IViolinConfig,
    scales: Scales,
): Promise<PlotlyInfo> {
    let plotCounter = 1;

    if(!config.numColumnsSelected || !config.catColumnsSelected) {
        return {
            plots: [],
            legendPlots: [],
            rows: 0,
            cols: 0,
            errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.violinError'),
        };
    }



    const numCols: VisNumericalColumn[] = config.numColumnsSelected.map((c) => columns.find((col) => col.info.id === c.id) as VisNumericalColumn);
    const catCols: VisCategoricalColumn[] = config.catColumnsSelected.map((c) => columns.find((col) => col.info.id === c.id) as VisCategoricalColumn);
    const plots: PlotlyData[] = [];

    const numColValues = await resolveColumnValues(numCols);
    const catColValues = await resolveColumnValues(catCols);

    //if we onl have numerical columns, add them individually.
    if(catColValues.length === 0) {
        for(const numCurr of numColValues) {
            plots.push( {
                    data: {
                        y: numCurr.resolvedValues.map((v) => v.val),
                        xaxis: plotCounter === 1 ? 'x' : 'x' + plotCounter,
                        yaxis: plotCounter === 1 ? 'y' : 'y' + plotCounter,
                        type: 'violin',
                        pointpos: 0,
                        jitter: .3,
                        // @ts-ignore
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
            plotCounter += 1;
        }
    }

    for(const numCurr of numColValues) {
        for(const catCurr of catColValues) {
            plots.push( {
                    data: {
                        x: catCurr.resolvedValues.map((v) => v.val),
                        y: numCurr.resolvedValues.map((v) => v.val),
                        xaxis: plotCounter === 1 ? 'x' : 'x' + plotCounter,
                        yaxis: plotCounter === 1 ? 'y' : 'y' + plotCounter,
                        type: 'violin',
                        // @ts-ignore
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
                            groups: catCurr.resolvedValues.map((v) => v.val) as string[],
                            styles:
                                [...new Set<string>(catCurr.resolvedValues.map((v) => v.val) as string[])].map((c) => {
                                    return {target: c, value: {line: {color: scales.color(c)}}};
                                })
                            }]
                    },
                    xLabel: catCurr.info.name,
                    yLabel: numCurr.info.name
                },
            );
            plotCounter += 1;
        }
    }

    return {
        plots,
        legendPlots: [],
        rows: numColValues.length,
        cols: catColValues.length > 0 ? catColValues.length : 1,
        errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.violinError'),

    };
}

