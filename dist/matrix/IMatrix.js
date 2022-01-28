import { DataUtils } from '../data';
import { BaseUtils } from '../base/BaseUtils';
export class MatrixUtils {
    static createDefaultMatrixDesc() {
        return BaseUtils.mixin(DataUtils.createDefaultDataDesc(), {
            type: 'matrix',
            rowtype: '_rows',
            coltype: '_cols',
            size: [0, 0],
        });
    }
}
//# sourceMappingURL=IMatrix.js.map