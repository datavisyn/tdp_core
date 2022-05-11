import { merge } from 'lodash';
import { EColumnTypes, ESupportedPlotlyVis } from '../interfaces';
export function isSankey(s) {
    return s.type === ESupportedPlotlyVis.SANKEY;
}
const defaultConfig = {
    type: ESupportedPlotlyVis.SANKEY,
};
export function sankeyMergeDefaultConfig(columns, config) {
    const merged = merge({}, defaultConfig, config);
    const numCols = columns.filter((c) => c.type === EColumnTypes.CATEGORICAL);
    return merged;
}
//# sourceMappingURL=utils.js.map