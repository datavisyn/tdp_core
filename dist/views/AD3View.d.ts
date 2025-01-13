import { Selection } from 'd3v3';
import { AView } from './AView';
import { ISelection, IViewContext } from '../base/interfaces';
/**
 * utiltity view to work with the node using d3
 * @deprecated
 */
export declare abstract class AD3View extends AView {
    protected readonly $node: Selection<this>;
    constructor(context: IViewContext, selection: ISelection, parent: HTMLElement);
}
//# sourceMappingURL=AD3View.d.ts.map