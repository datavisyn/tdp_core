import d3 from 'd3';
import { merge } from 'lodash';
import { I18nextManager } from '../../i18n';
import { PlotlyInfo, PlotlyData, EColumnTypes, ESupportedPlotlyVis, IVisConfig, VisColumn, IPCPConfig } from '../interfaces';
import { resolveColumnValues } from '../general/layoutUtils';

export function isPCP(s: IVisConfig): s is IPCPConfig {
  return s.type === ESupportedPlotlyVis.PCP;
}

const defaultConfig: IPCPConfig = {
  type: ESupportedPlotlyVis.PCP,
  allColumnsSelected: [],
};

export function pcpMergeDefaultConfig(columns: VisColumn[], config: IPCPConfig): IVisConfig {
  const merged = merge({}, defaultConfig, config);

  if (merged.allColumnsSelected.length === 0 && columns.length > 1) {
    // FIXME It is always selecting the last two columns, no matter their type. (@see https://github.com/datavisyn/reprovisyn/issues/199)
    merged.allColumnsSelected.push(columns[columns.length - 1].info);
    merged.allColumnsSelected.push(columns[columns.length - 2].info);
  } else if (merged.allColumnsSelected.length === 1 && columns.length > 1) {
    if (columns[columns.length - 1].info.id !== merged.allColumnsSelected[0].id) {
      merged.allColumnsSelected.push(columns[columns.length - 1].info);
    } else {
      merged.allColumnsSelected.push(columns[columns.length - 2].info);
    }
  }

  return merged;
}

export async function createPCPTraces(columns: VisColumn[], config: IPCPConfig): Promise<PlotlyInfo> {
  if (!config.allColumnsSelected) {
    return {
      plots: [],
      legendPlots: [],
      rows: 0,
      cols: 0,
      errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.pcpError'),
    };
  }

  const allCols: VisColumn[] = config.allColumnsSelected.map((c) => columns.find((col) => col.info.id === c.id));

  if (config.allColumnsSelected.length < 2) {
    return {
      plots: [],
      legendPlots: [],
      rows: 0,
      cols: 0,
      errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.pcpError'),
    };
  }

  const allColValues = await resolveColumnValues(allCols);

  const plot: PlotlyData = {
    xLabel: null,
    yLabel: null,
    data: {
      type: 'parcoords',
      // @ts-ignore
      dimensions: allColValues.map((c) => {
        if (c.type === EColumnTypes.NUMERICAL) {
          return {
            range: [d3.min(c.resolvedValues.map((v) => v.val) as number[]), d3.max(c.resolvedValues.map((v) => v.val) as number[])],
            label: c.info.name,
            values: c.resolvedValues.map((v) => v.val),
          };
        }
        const uniqueList = [...new Set<string>(c.resolvedValues.map((v) => v.val) as string[])];

        return {
          range: [0, uniqueList.length - 1],
          label: c.info.name,
          values: c.resolvedValues.map((curr) => uniqueList.indexOf(curr.val as string)),
          tickvals: [...uniqueList.keys()],
          ticktext: uniqueList,
        };
      }),
    },
  };

  return {
    plots: [plot],
    legendPlots: [],
    rows: 1,
    cols: 1,
    errorMessage: I18nextManager.getInstance().i18n.t('tdp:core.vis.pcpError'),
  };
}
