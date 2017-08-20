/**
 * Created by Samuel Gratzl on 29.01.2016.
 */

import {ISelection, IViewContext} from './interfaces';
import AView from './AView';
import {select, Selection} from 'd3';

export {resolveIds, resolveId, resolveIdToNames} from './AView';

export abstract class AD3View extends AView {
  protected $node: Selection<this>;

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement) {
    super(context, selection, parent);
    this.$node = select(this.node).datum(this);
  }
}

export default AD3View;
