import { DataUtils } from '../data/DataUtils';
import { BaseUtils } from '../base/BaseUtils';
export class VectorUtils {
    static createDefaultVectorDesc() {
        return BaseUtils.mixin(DataUtils.createDefaultDataDesc(), {
            type: 'vector',
            idtype: '_rows',
            size: 0,
            value: {
                type: 'string'
            }
        });
    }
}
//# sourceMappingURL=VectorUtils.js.map