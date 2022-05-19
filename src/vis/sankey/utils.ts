import { merge } from 'lodash';
import { ESupportedPlotlyVis, ISankeyConfig, IVisConfig, VisColumn } from '../interfaces';

export function isSankey(s: IVisConfig): s is ISankeyConfig {
  return s.type === ESupportedPlotlyVis.SANKEY;
}

const defaultConfig: ISankeyConfig = {
  type: ESupportedPlotlyVis.SANKEY,
  catColumnsSelected: [],
};

export function sankeyMergeDefaultConfig(columns: VisColumn[], config: ISankeyConfig): IVisConfig {
  const merged = merge({}, defaultConfig, config);
  return merged;
}
