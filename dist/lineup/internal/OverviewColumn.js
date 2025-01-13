import { BooleanColumn, Column } from 'lineupjs';
import { I18nextManager } from 'visyn_core/i18n';
/**
 * extra column for highlighting and filtering
 */
export class OverviewColumn extends BooleanColumn {
    constructor(id, desc) {
        super(id, Object.assign(desc, {
            label: I18nextManager.getInstance().i18n.t('tdp:core.lineup.OverviewColumn.overviewSelection'),
            renderer: 'boolean',
            groupRenderer: 'boolean',
            summaryRenderer: 'categorical',
        }));
        this.overviewSelection = new Set();
        this.setWidthImpl(0); // hide
    }
    getValue(row) {
        return this.overviewSelection.has(row.v);
    }
    setOverview(rows, name = I18nextManager.getInstance().i18n.t('tdp:core.lineup.OverviewColumn.focus')) {
        this.currentOverview = { name, rows };
        this.fire([Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.overviewSelection, (this.overviewSelection = new Set(rows || [])));
    }
    getOverview() {
        return this.currentOverview;
    }
    get categoryLabels() {
        return [
            I18nextManager.getInstance().i18n.t('tdp:core.lineup.OverviewColumn.selectedInOverview'),
            I18nextManager.getInstance().i18n.t('tdp:core.lineup.OverviewColumn.rest'),
        ];
    }
    get categoryColors() {
        return ['#EEEEEE', '#AAAAAA'];
    }
    group(row) {
        const enabled = this.getValue(row);
        return enabled ? OverviewColumn.GROUP_TRUE : OverviewColumn.GROUP_FALSE;
    }
}
OverviewColumn.GROUP_TRUE = { name: I18nextManager.getInstance().i18n.t('tdp:core.lineup.OverviewColumn.selectedInOverview'), color: 'white' };
OverviewColumn.GROUP_FALSE = { name: I18nextManager.getInstance().i18n.t('tdp:core.lineup.OverviewColumn.rest'), color: '#AAAAAA' };
//# sourceMappingURL=OverviewColumn.js.map