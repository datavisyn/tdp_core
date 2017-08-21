/**
 * Created by Samuel Gratzl on 29.01.2016.
 */
import {ABaseSelectionAdapter} from './ABaseSelectionAdapter';
import {IContext, ISelectionAdapter} from '../ISelectionAdapter';
import {IAdditionalColumnDesc} from '../../desc';
import {IScoreRow} from '../../IScore';

export interface ISingleSelectionAdapter {
  createDesc(_id: number, id: string): Promise<IAdditionalColumnDesc>;

  loadData(_id: number, id: string): Promise<IScoreRow<any>[]>;
}

export default class SingleSelectionAdapter extends ABaseSelectionAdapter implements ISelectionAdapter {
  constructor(private readonly adapter: ISingleSelectionAdapter) {
    super();
  }
  parameterChanged() {
    // dummy
  }

  protected createColumnsFor(context: IContext, _id: number, id: string) {
    return this.adapter.createDesc(_id, id).then((desc) => [{desc, data: this.adapter.loadData(_id, id), id: _id}]);
  }
}
