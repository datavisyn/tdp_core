import {IAdditionalColumnDesc} from '../../../base/interfaces';

export interface ISearchOption extends Pick<IAdditionalColumnDesc, 'group'> {
    text: string;
    id: string;
    action(): void;
}
