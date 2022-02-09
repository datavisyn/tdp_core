import { LocalDataProvider } from 'lineupjs';
import { ARankingView } from './ARankingView';
import { BuilderUtils, LayoutContainerEvents } from '../layout';
import { OverviewColumn } from './internal/OverviewColumn';
import { BaseUtils } from '../base';
import { I18nextManager } from '../i18n';
export class AOverviewDetailRankingView extends ARankingView {
    constructor(context, selection, parent, options = {}) {
        super(context, selection, parent, options);
        this.triggerOverviewUpdateDelayed = BaseUtils.debounce(() => this.triggerOverviewUpdate(), 100);
        this.triggerUpdateDelayed = BaseUtils.debounce(() => this.update(), 100);
        this.node.classList.add('overview-detail');
        this.overview = this.node.ownerDocument.createElement('header');
        this.overview.classList.add('overview');
        const root = this.wrapTable();
        this.split = root.root;
    }
    initImpl() {
        return Promise.all([super.initImpl(), this.buildOverview()]);
    }
    showDetailRanking(showRanking = true) {
        const r = this.split.ratios[1];
        if (r > 0.1 === showRanking) {
            return;
        }
        this.setRatio(showRanking ? 0.5 : 1);
    }
    setRatio(ratio = 0.5) {
        this.split.setRatio(0, ratio);
    }
    /**
     * wrap with phovea split layout
     */
    wrapTable() {
        const wrapper = this.node.firstElementChild;
        wrapper.remove();
        const lineup = wrapper.firstElementChild;
        const lineupView = {
            node: lineup,
            destroy: () => undefined,
            dumpReference: () => -1,
            visible: false,
        };
        const overviewView = {
            node: this.overview,
            destroy: () => undefined,
            dumpReference: () => -1,
            visible: true,
        };
        const r = BuilderUtils.root(BuilderUtils.verticalSplit(1, BuilderUtils.view(overviewView).name(I18nextManager.getInstance().i18n.t('tdp:core.lineup.OverviewDetailRanking.overview')).hideHeader(), BuilderUtils.view(lineupView).name(I18nextManager.getInstance().i18n.t('tdp:core.lineup.OverviewDetailRanking.detailTable')).hideHeader()));
        this.node.insertAdjacentElement('afterbegin', r.node);
        r.on(LayoutContainerEvents.EVENT_LAYOUT_CHANGED, () => {
            this.triggerOverviewUpdateDelayed();
            this.triggerUpdateDelayed();
        });
        return r;
    }
    builtLineUp(lineup) {
        super.builtLineUp(lineup);
        this.lineup = lineup;
        this.lineup.on(`${LocalDataProvider.EVENT_ORDER_CHANGED}.overview`, () => {
            this.triggerOverviewUpdateDelayed();
        });
        // add an artificial hidden overview column to split overview and detail
        this.lineup.columnTypes.overview = OverviewColumn;
        this.overviewColumn = this.lineup.create({
            type: 'overview',
            label: '',
        });
        // add our helper column at the beginning
        this.lineup.getRankings()[0].insert(this.overviewColumn, 2);
        // aggregate the rest overview group by default
        this.lineup.setAggregated(lineup.getRankings()[0], OverviewColumn.GROUP_FALSE, true);
        this.overviewColumn.groupSortByMe(false);
        this.overviewColumn.groupByMe();
        this.triggerOverviewUpdate();
    }
    triggerOverviewUpdate() {
        if (this.split.ratios[0] <= 0.01 || !this.lineup) {
            return; // hidden overview
        }
        const r = this.lineup.getRankings()[0];
        const order = r.getOrder();
        const currentRows = this.lineup.view(order);
        let { width, height } = this.overview.getBoundingClientRect();
        // some padding
        width -= 20;
        height -= 20;
        this.updateOverview(currentRows, width, height, this.overviewColumn.getOverview());
    }
    setRowSelection(rows) {
        if (!this.lineup) {
            return;
        }
        this.lineup.setSelection(rows.map((r) => this.lineup.data.indexOf(r)));
    }
    getRowSelection() {
        if (!this.lineup) {
            return new Set();
        }
        return new Set(this.lineup.selectedRows());
    }
    focusOn(rows, name = 'focus') {
        if (!this.lineup || !this.overviewColumn) {
            return;
        }
        this.overviewColumn.setOverview(rows, name);
    }
}
//# sourceMappingURL=AOverviewDetailRankingView.js.map