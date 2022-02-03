import { select } from 'd3';
import { AView } from './AView';
/**
 * utiltity view to work with the node using d3
 * @deprecated
 */
export class AD3View extends AView {
    constructor(context, selection, parent) {
        super(context, selection, parent);
        this.$node = select(this.node).datum(this);
    }
}
//# sourceMappingURL=AD3View.js.map