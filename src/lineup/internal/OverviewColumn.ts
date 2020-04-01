/**
 * a string column with optional alignment
 */
import {Column, IDataRow, BooleanColumn, IBooleanColumnDesc} from 'lineupjs';
import i18n from 'phovea_core/src/i18n';

/**
 * extra column for highlighting and filtering
 */
export default class OverviewColumn extends BooleanColumn {
  static readonly GROUP_TRUE = {name: i18n.t('tdp:core.lineup.OverviewColumn.selectedInOverview'), color: 'white'};
  static readonly GROUP_FALSE = {name: i18n.t('tdp:core.lineup.OverviewColumn.rest'), color: '#AAAAAA'};

  private overviewSelection = new Set<any>();
  private currentOverview: {name: string, rows: any[]};

  constructor(id: string, desc: IBooleanColumnDesc) {
    super(id, Object.assign(desc, {
      label: i18n.t('tdp:core.lineup.OverviewColumn.overviewSelection')
    }));
    (<OverviewColumn>this).setDefaultRenderer('boolean');
    (<OverviewColumn>this).setDefaultGroupRenderer('boolean');
    (<OverviewColumn>this).setDefaultSummaryRenderer('categorical');
    (<OverviewColumn>this).setWidthImpl(0); // hide
  }

  getValue(row: IDataRow) {
    return this.overviewSelection.has(row.v);
  }

  setOverview(rows?: any[], name = i18n.t('tdp:core.lineup.OverviewColumn.focus')) {
    this.currentOverview = {name, rows};
    (<OverviewColumn>this).fire([Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.overviewSelection, this.overviewSelection = new Set<any>(rows || []));
  }

  getOverview() {
    return this.currentOverview;
  }

  get categoryLabels() {
    return [i18n.t('tdp:core.lineup.OverviewColumn.selectedInOverview'), i18n.t('tdp:core.lineup.OverviewColumn.rest')];
  }

  get categoryColors() {
    return ['#EEEEEE', '#AAAAAA'];
  }

  group(row: IDataRow) {
    const enabled = this.getValue(row);
    return enabled ? OverviewColumn.GROUP_TRUE : OverviewColumn.GROUP_FALSE;
  }
}
