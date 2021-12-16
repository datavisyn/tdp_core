import { AppContext } from '../app/AppContext';
import { ParseRangeUtils, Range1DGroup, Range, CompositeRange1D } from '../range';
import { IDTypeManager } from '../idtype';
function createRangeFromGroups(name, groups) {
    return CompositeRange1D.composite(name, groups.map((g) => {
        return new Range1DGroup(g.name, g.color || 'gray', ParseRangeUtils.parseRangeLike(g.range).dim(0));
    }));
}
export class StratificationLoaderUtils {
    static viaAPILoader() {
        let _data = undefined;
        return (desc) => {
            if (!_data) { //in the cache
                _data = AppContext.getInstance().getAPIJSON('/dataset/' + desc.id).then((data) => {
                    const idType = IDTypeManager.getInstance().resolveIdType(desc.idtype);
                    const rowIds = ParseRangeUtils.parseRangeLike(data.rowIds);
                    idType.fillMapCache(rowIds.dim(0).asList(data.rows.length), data.rows);
                    return {
                        rowIds,
                        rows: data.rows,
                        range: createRangeFromGroups(desc.name, data.groups)
                    };
                });
            }
            return _data;
        };
    }
    static viaDataLoader(rows, rowIds, range) {
        let _data = undefined;
        return () => {
            if (!_data) { //in the cache
                _data = Promise.resolve({
                    rowIds: Range.list(rowIds),
                    rows,
                    range
                });
            }
            return _data;
        };
    }
}
//# sourceMappingURL=loader.js.map