import { AppContext } from '../app/AppContext';
import { ParseRangeUtils } from '../range';
import { ValueTypeUtils } from '../data';
import { IDTypeManager } from '../idtype/IDTypeManager';
export class VectorLoaderUtils {
    /**
     * @internal
     */
    static viaAPILoader() {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        let _loader;
        return (desc) => {
            if (_loader) {
                // in the cache
                return _loader;
            }
            return (_loader = AppContext.getInstance()
                .getAPIJSON(`/dataset/${desc.id}`)
                .then((data) => {
                const range = ParseRangeUtils.parseRangeLike(data.rowIds);
                data.rowIds = range;
                data.data = ValueTypeUtils.mask(data.data, desc.value);
                const idType = IDTypeManager.getInstance().resolveIdType(desc.idtype);
                idType.fillMapCache(range.dim(0).asList(data.rows.length), data.rows);
                return data;
            }));
        };
    }
    /**
     * @internal
     */
    static viaDataLoader(rows, rowIds, data) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        let _data;
        return () => {
            if (_data) {
                // in the cache
                return Promise.resolve(_data);
            }
            _data = {
                rowIds: ParseRangeUtils.parseRangeLike(rowIds),
                rows,
                data,
            };
            return Promise.resolve(_data);
        };
    }
}
//# sourceMappingURL=loader.js.map