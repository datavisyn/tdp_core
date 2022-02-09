import { BaseUtils } from '../base/BaseUtils';
import { DataUtils } from '../data';
export class AtomUtils {
    static createDefaultAtomDesc() {
        return BaseUtils.mixin(DataUtils.createDefaultDataDesc(), {
            type: 'atom',
            idtype: '_rows',
            value: {
                type: 'string',
            },
        });
    }
}
//# sourceMappingURL=IAtom.js.map