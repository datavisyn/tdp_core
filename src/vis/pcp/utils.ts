import d3 from 'd3';
import {merge} from 'lodash';
import {CategoricalColumn, ColumnInfo, EColumnTypes, ESupportedPlotlyVis, IVisConfig, NumericalColumn} from '../interfaces';
import {PlotlyInfo, PlotlyData} from '../interfaces';

export function isPCP(s: IVisConfig): s is IPCPConfig {
    return s.type === ESupportedPlotlyVis.PCP;
}

export interface IPCPConfig {
    type: ESupportedPlotlyVis.PCP;
    numColumnsSelected: ColumnInfo[];
    catColumnsSelected: ColumnInfo[];
}

const defaultConfig: IPCPConfig = {
    type: ESupportedPlotlyVis.PCP,
    numColumnsSelected: [],
    catColumnsSelected: [],
};

export function pcpMergeDefaultConfig(
    columns: (NumericalColumn | CategoricalColumn)[],
    config: IPCPConfig,
): IVisConfig {
    const merged = merge(defaultConfig, config);

    if(merged.numColumnsSelected.length === 0 && columns.length > 1) {
        merged.numColumnsSelected.push(columns[columns.length - 1].info);
        merged.numColumnsSelected.push(columns[columns.length - 2].info);
    } else if(merged.numColumnsSelected.length === 1 && columns.length > 1) {
        if(columns[columns.length - 1].info.id !== merged.numColumnsSelected[0].id) {
            merged.numColumnsSelected.push(columns[columns.length - 1].info);
        } else {
            merged.numColumnsSelected.push(columns[columns.length - 2].info);
        }
    }

    return merged;
}

export function createPCPTraces(
    columns: (NumericalColumn | CategoricalColumn)[],
    config: IPCPConfig,
): PlotlyInfo {

    if(!config.numColumnsSelected || !config.catColumnsSelected) {
        return {
            plots: [],
            legendPlots: [],
            rows: 0,
            cols: 0,
            errorMessage: 'To create a Parallel Coordinates plot, please select at least 2 columns.',
            formList: []
        };
    }

    const numCols: NumericalColumn[] = columns.filter((c) => config.numColumnsSelected.filter((d) => c.info.id === d.id).length > 0 && EColumnTypes.NUMERICAL) as NumericalColumn[];
    const catCols: CategoricalColumn[] = columns.filter((c) => config.numColumnsSelected.filter((d) => c.info.id === d.id).length > 0 && EColumnTypes.CATEGORICAL) as CategoricalColumn[];

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
