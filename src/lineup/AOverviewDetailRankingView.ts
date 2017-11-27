

import ARankingView, {IARankingViewOptions} from './ARankingView';
import {ISelection, IViewContext} from '../views';
import {ISplitLayoutContainer, root, verticalSplit, view} from 'phovea_ui/src/layout';

export abstract class AOverviewDetailRankingView extends ARankingView {

  protected readonly overview: HTMLElement;
  private readonly split: ISplitLayoutContainer;

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: Partial<IARankingViewOptions> = {}) {
    super(context, selection, parent, options);

    this.node.classList.add('overview-detail');
    this.overview = this.node.ownerDocument.createElement('header');

    const root = this.wrapTable();
    this.split = <ISplitLayoutContainer>root.root;
  }

  protected setRatio(ratio = 0.5) {
    this.split.setRatio(0, ratio);
  }

  /**
   * wrap with phovea split layout
   */
  private wrapTable() {
    const wrapper = this.node.firstElementChild!;
    wrapper.remove();
    const lineup = <HTMLElement>wrapper.firstElementChild!;
    const lineupView = {
      node: lineup,
      destroy: () => undefined,
      dumpReference: () => -1,
      visible: false,
      resized: () => this.update()
    };

    const r = root(verticalSplit(1,
      view(this.overview).name('Overview').hideHeader(),
      view(lineupView).name('Detail Table').hideHeader()));
    this.node.insertAdjacentElement('afterbegin', r.node);

    return r;
  }
}
