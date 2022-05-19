import { merge } from 'lodash';
import { ESupportedPlotlyVis } from '../interfaces';
export function isSankey(s) {
    return s.type === ESupportedPlotlyVis.SANKEY;
}
const defaultConfig = {
    type: ESupportedPlotlyVis.SANKEY,
    catColumnsSelected: []
};
export function sankeyMergeDefaultConfig(columns, config) {
    const merged = merge({}, defaultConfig, config);
    return merged;
}
//# sourceMappingURL=utils.js.map