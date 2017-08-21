/**
 * Created by Samuel Gratzl on 29.01.2016.
 */
import {ABaseSelectionAdapter} from './ABaseSelectionAdapter';
import {IContext, ISelectionAdapter} from '../ISelectionAdapter';
import {IAdditionalColumnDesc} from '../../desc';
import {IScoreRow} from '../../IScore';

export interface ISingleSelectionAdapter {
  createDesc(context: IContext, id: number): Promise<IAdditionalColumnDesc>;

  loadData(context: IContext, id: number): Promise<IScoreRow<any>[]>;
}

export default class SingleSelectionAdapter extends ABaseSelectionAdapter implements ISelectionAdapter {
  constructor(private readonly adapter: ISingleSelectionAdapter) {
    super();
  }
  parameterChanged() {
    // dummy
  }

  protected createColumnsFor(context: IContext, id: number) {
    return this.adapter.createDesc(context, id).then((desc) => [{desc, data: this.adapter.loadData(context, id), id}]);
  }
}
