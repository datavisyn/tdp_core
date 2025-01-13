import { IColumnDesc } from 'lineupjs';

import type { IAdditionalColumnDesc } from '../../base/interfaces';

export interface ISearchOption extends Pick<IAdditionalColumnDesc, 'chooserGroup'> {
  text: string;
  id: string;
  action(): void;

  /**
   * Column description used by `formatSearchBoxItem()`
   * Optional because the column description is only available for non-grouped items
   */
  desc?: IColumnDesc;
}
