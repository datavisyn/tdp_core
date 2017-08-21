/**
 * Created by Samuel Gratzl on 29.01.2016.
 */
import {IAdditionalColumnDesc} from '../../desc';
import {array_diff} from '../../internal/LineUpSelectionHelper';
import {ISelectionColumn, IContext} from '../ISelectionAdapter';

export abstract class ABaseSelectionAdapter {

  protected addDynamicColumns(context: IContext, ids: number[]) : void {
    Promise.all(ids.map((id) => this.createColumnsFor(context, id))).then((columns) => {
      context.add([].concat(...columns));
    });
  }

  private removeDynamicColumns(context: IContext, ids: number[]) : void {
    const columns = context.columns;
   context.remove([].concat(...ids.map((id) => {
     context.freeColor(id);
     return columns.filter((d) => (<IAdditionalColumnDesc>d.desc).selectedId === id);
   })));
  }

  selectionChanged(context: IContext) {
    const selectedIds = context.selection.range.dim(0).asList();
    const usedCols = context.columns.filter((d) => (<IAdditionalColumnDesc>d.desc).selectedId !== -1);
    const lineupColIds = usedCols
      .map((d) => (<IAdditionalColumnDesc>d.desc).selectedId)
      .filter((d) => d !== undefined);

    // compute the difference
    const diffAdded = array_diff(selectedIds, lineupColIds);
    const diffRemoved = array_diff(lineupColIds, selectedIds);

    // add new columns to the end
    if (diffAdded.length > 0) {
      //console.log('add columns', diffAdded);
      this.addDynamicColumns(context, diffAdded);
    }

    // remove deselected columns
    if (diffRemoved.length > 0) {
        //console.log('remove columns', diffRemoved);
      this.removeDynamicColumns(context, diffRemoved);
    }
  }

  protected abstract createColumnsFor(context: IContext, id: number): Promise<ISelectionColumn[]>;
}

export default ABaseSelectionAdapter;
