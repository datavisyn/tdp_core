import {IAdditionalColumnDesc} from '../../../base/interfaces';

export interface ISearchOption extends Pick<IAdditionalColumnDesc, 'chooserGroup'> {
    text: string;
    id: string;
    action(): void;
}
