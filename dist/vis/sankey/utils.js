import { merge } from 'lodash';
import { ESupportedPlotlyVis } from '../interfaces';
export function isSankey(s) {
    return s.type === ESupportedPlotlyVis.SANKEY;
}
/**const defaultConfig: ISankeyConfig = {
  type: 'Sankey',
  catColumnsSelected: [],
};**/
export function sankeyMergeDefaultConfig(columns, config, defaultConfig) {
    const merged = merge({}, defaultConfig, config);
    return merged;
}
//# sourceMappingURL=utils.js.map