

import ARankingView, {IARankingViewOptions} from './ARankingView';
import {ISelection, IViewContext} from '../views';
import {ISplitLayoutContainer, root, verticalSplit, view} from 'phovea_ui/src/layout';
import {IRow} from '../rest';
import ADataProvider from 'lineupjs/src/provider/ADataProvider';

export abstract class AOverviewDetailRankingView extends ARankingView {

  protected readonly overview: HTMLElement;
  private readonly split: ISplitLayoutContainer;

  private lineup: ADataProvider;

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: Partial<IARankingViewOptions> = {}) {
    super(context, selection, parent, options);

    this.node.classList.add('overview-detail');
    this.overview = this.node.ownerDocument.createElement('header');
    this.overview.classList.add('overview');

    const root = this.wrapTable();
    this.split = <ISplitLayoutContainer>root.root;
  }

  protected initImpl() {
    return <Promise<any>>Promise.all([super.initImpl(), this.buildOverview()]);
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

  protected builtLineUp(lineup: ADataProvider) {
    super.builtLineUp(lineup);

    this.lineup = lineup;
    this.lineup.on(`${ADataProvider.EVENT_ORDER_CHANGED}.overview`, () => {
      this.triggerOverviewUpdate();
    });
    this.triggerOverviewUpdate();
  }

  private triggerOverviewUpdate() {
    if (this.split.ratios[0] <= 0.01) {
      return; // hidden overview
    }
    const r = this.lineup.getRankings()[0];
    const order = r.getOrder();
    const currentRows = <IRow[]>this.lineup.view(order);
    this.updateOverview(currentRows);
  }

  protected setRowSelection(indices: number[]) {
    if (this.lineup) {
      this.lineup.setSelection(indices);
    }
  }

  protected getRowSelection() {
    if (!this.lineup) {
      return new Set<number>();
    }
    return new Set(this.lineup.getSelection());
  }

  protected abstract buildOverview(): Promise<any>|void;
  protected abstract updateOverview(rows: IRow[]): void;
}
