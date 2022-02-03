import { ITableDataDescription } from './ITable';
import { BaseUtils } from '../base/BaseUtils';
import { DataUtils } from '../data/DataUtils';

export class TableUtils {
  static createDefaultTableDesc(): ITableDataDescription {
    return <ITableDataDescription>BaseUtils.mixin(DataUtils.createDefaultDataDesc(), {
      type: 'table',
      idtype: '_rows',
      columns: [],
      size: [0, 0],
    });
  }
}
