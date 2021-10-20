import { BaseUtils } from '../base/BaseUtils';
import { DataUtils } from '../data/DataUtils';
export class TableUtils {
    static createDefaultTableDesc() {
        return BaseUtils.mixin(DataUtils.createDefaultDataDesc(), {
            type: 'table',
            idtype: '_rows',
            columns: [],
            size: [0, 0]
        });
    }
}
//# sourceMappingURL=TableUtils.js.map