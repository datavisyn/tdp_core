import {ISelection, IViewContext} from '../base/interfaces';
import {AView} from './AView';
import {select, Selection} from 'd3';


/**
 * utiltity view to work with the node using d3
 * @deprecated
 */
export abstract class AD3View extends AView {
  protected readonly $node: Selection<this>;

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement) {
    super(context, selection, parent);
    this.$node = select(this.node).datum(this);
  }
}
