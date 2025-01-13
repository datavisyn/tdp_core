import { Selection, select } from 'd3v3';

import { AView } from './AView';
import { ISelection, IViewContext } from '../base/interfaces';

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
