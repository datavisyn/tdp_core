import { merge } from 'lodash';
import { BaseConfig, ESupportedPlotlyVis, ISankeyConfig, IVisConfig, VisColumn } from '../interfaces';

export function isSankey(s: IVisConfig): s is ISankeyConfig {
  return s.type === ESupportedPlotlyVis.SANKEY;
}

/**const defaultConfig: ISankeyConfig = {
  type: 'Sankey',
  catColumnsSelected: [],
};**/

export function sankeyMergeDefaultConfig(columns: VisColumn[], config: ISankeyConfig, defaultConfig: ISankeyConfig): BaseConfig<'Sankey'> {
  const merged = merge({}, defaultConfig, config);
  return merged;
}
