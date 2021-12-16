import d3 from 'd3';
import {merge} from 'lodash';
import {VisCategoricalColumn, ColumnInfo, EColumnTypes, ESupportedPlotlyVis, IVisConfig, VisNumericalColumn, VisColumn} from '../interfaces';
import {PlotlyInfo, PlotlyData} from '../interfaces';
import {resolveColumnValues} from '../layoutUtils';

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
    columns: VisColumn[],
    config: IPCPConfig,
): IVisConfig {
    const merged = merge({}, defaultConfig, config);

    if(merged.numColumnsSelected.length === 0 && columns.length > 1) {
        // TODO: Bug. It is always selecting the last two columns, no matter their type.
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

export async function createPCPTraces(
    columns: VisColumn[],
    config: IPCPConfig,
): Promise<PlotlyInfo> {

    if(!config.numColumnsSelected || !config.catColumnsSelected) {
        return {
            plots: [],
            legendPlots: [],
            rows: 0,
            cols: 0,
            errorMessage: 'To create a Parallel Coordinates plot, please select at least 2 columns.',
        };
    }

    const numCols: VisNumericalColumn[] = columns.filter((c) => config.numColumnsSelected.some((d) => c.info.id === d.id) && c.type === EColumnTypes.NUMERICAL) as VisNumericalColumn[];
    const catCols: VisCategoricalColumn[] = columns.filter((c) => config.catColumnsSelected.some((d) => c.info.id === d.id) && c.type === EColumnTypes.CATEGORICAL) as VisCategoricalColumn[];

    if(numCols.length + catCols.length < 2) {
        return {
            plots: [],
            legendPlots: [],
            rows: 0,
            cols: 0,
            errorMessage: 'To create a Parallel Coordinates plot, please select at least 2 columns.',
        };
    }

    const numColValues = await resolveColumnValues(numCols);
    const catColValues = await resolveColumnValues(catCols);

    const plot: PlotlyData = {
      xLabel: null,
      yLabel: null,
      data: {
        dimensions: [
          ...numColValues.map((c, i) => {
            return {
              range: [
                d3.min(c.resolvedValues.map((v) => v.val) as number[]),
                d3.max(c.resolvedValues.map((v) => v.val) as number[]),
              ],
              label: c.info.name,
              values: c.resolvedValues.map((v) => v.val),
            };
          }),
          ...catColValues.map((c) => {
            const uniqueList = [
              ...new Set<string>(c.resolvedValues.map((v) => v.val) as string[]),
            ];

            return {
              range: [0, uniqueList.length - 1],
              label: c.info.name,
              values: c.resolvedValues.map((curr) => uniqueList.indexOf(curr.val)),
              tickvals: [...uniqueList.keys()],
              ticktext: uniqueList,
            };
          }),
        ],
        type: "parcoords",
        line: {
          shape: "spline",
          // @ts-ignore
          opacity: 0.2,
        },
      },
    };

    return {
        plots: [plot],
        legendPlots: [],
        rows: 1,
        cols: 1,
        errorMessage: 'To create a Parallel Coordinates plot, please select at least 2 columns.',
    };
}
