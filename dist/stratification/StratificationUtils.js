import { BaseUtils } from '../base/BaseUtils';
import { DataUtils } from '../data';
export class StratificationUtils {
    static createDefaultStratificationDesc() {
        return BaseUtils.mixin(DataUtils.createDefaultDataDesc(), {
            type: 'stratification',
            idtype: '_rows',
            size: 0,
            groups: [],
            ngroups: 0,
        });
    }
}
//# sourceMappingURL=StratificationUtils.js.map