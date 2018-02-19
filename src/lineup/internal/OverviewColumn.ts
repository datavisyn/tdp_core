/**
 * a string column with optional alignment
 */
import BooleanColumn, {IBooleanColumnDesc} from 'lineupjs/src/model/BooleanColumn';
import Column from 'lineupjs/src/model/Column';

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
    this.setDefaultRenderer('boolean');
    this.setDefaultGroupRenderer('boolean');
    this.setWidthImpl(0); // hide
  }

  getValue(row: any, index: number) {
    return this.overviewSelection.has(row);
  }

  setOverview(rows?: any[], name = 'Focus') {
    this.currentOverview = {name, rows};
    this.fire([Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.overviewSelection, this.overviewSelection = new Set<any>(rows || []));
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

  group(row: any, index: number) {
    const enabled = this.getValue(row, index);
    return enabled ? OverviewColumn.GROUP_TRUE : OverviewColumn.GROUP_FALSE;
  }
}
