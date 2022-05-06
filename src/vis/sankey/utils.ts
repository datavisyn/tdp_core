import { merge } from 'lodash';
import { EColumnTypes, ESupportedPlotlyVis, ISankeyConfig, IVisConfig, VisColumn } from '../interfaces';

export function isSankey(s: IVisConfig): s is ISankeyConfig {
  return s.type === ESupportedPlotlyVis.SANKEY;
}

const defaultConfig: ISankeyConfig = {
  type: ESupportedPlotlyVis.SANKEY,
};

export function sankeyMergeDefaultConfig(columns: VisColumn[], config: ISankeyConfig): IVisConfig {
  const merged = merge({}, defaultConfig, config);

  const numCols = columns.filter((c) => c.type === EColumnTypes.CATEGORICAL);

  return merged;
}
