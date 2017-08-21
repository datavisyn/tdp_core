/**
 * Created by Samuel Gratzl on 29.01.2016.
 */
import {ABaseSelectionColumnAdapter} from './internal/ABaseSelectionColumnAdapter';
import {IContext, ISelectionAdapter} from './ISelectionAdapter';
import {IAdditionalColumnDesc} from '../desc';
import {IScoreRow} from '../IScore';

export abstract class ASelectionColumnAdapter extends ABaseSelectionColumnAdapter implements ISelectionAdapter {
  parameterChanged() {
    // dummy
  }

  protected createColumnsFor(context: IContext, id: number) {
    return this.createDesc(context, id).then((desc) => [{desc, data: this.loadData(context, id), id}]);
  }

  protected abstract createDesc(context: IContext, id: number): Promise<IAdditionalColumnDesc>;

  protected abstract loadData(context: IContext, id: number): Promise<IScoreRow<any>[]>;
}

export default ASelectionColumnAdapter;
