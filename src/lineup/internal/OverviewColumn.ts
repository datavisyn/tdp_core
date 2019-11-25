/**
 * a string column with optional alignment
 */
import {Column, IDataRow, BooleanColumn, IBooleanColumnDesc} from 'lineupjs';

/**
 * extra column for highlighting and filtering
 */
export default class OverviewColumn extends BooleanColumn {
  static readonly GROUP_TRUE = {name: 'Selected in Overview', color: 'white'};
  static readonly GROUP_FALSE = {name: 'Rest', color: '#AAAAAA'};

  private overviewSelection = new Set<any>();
  private currentOverview: {name: string, rows: any[]};

  constructor(id: string, desc: IBooleanColumnDesc) {
    super(id, Object.assign(desc, {
      label: 'Overview Selection'
    }));
    (<Column>this).setDefaultRenderer('boolean');
    (<Column>this).setDefaultGroupRenderer('boolean');
    (<Column>this).setDefaultSummaryRenderer('categorical');
    (<Column>this).setWidthImpl(0); // hide
  }

  getValue(row: IDataRow) {
    return this.overviewSelection.has(row.v);
  }

  setOverview(rows?: any[], name = 'Focus') {
    this.currentOverview = {name, rows};
    (<Column>this).fire([Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.overviewSelection, this.overviewSelection = new Set<any>(rows || []));
  }

  getOverview() {
    return this.currentOverview;
  }

  get categoryLabels() {
    return ['Selected in Overview', 'Rest'];
  }

  get categoryColors() {
    return ['#EEEEEE', '#AAAAAA'];
  }

  group(row: IDataRow) {
    const enabled = this.getValue(row);
    return enabled ? OverviewColumn.GROUP_TRUE : OverviewColumn.GROUP_FALSE;
  }
}
