import { IAdditionalColumnDesc } from '../../base/interfaces';
import { IColumnDesc } from 'lineupjs';
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
