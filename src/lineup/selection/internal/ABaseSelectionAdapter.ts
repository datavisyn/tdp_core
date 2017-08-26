/**
 * Created by Samuel Gratzl on 29.01.2016.
 */
import {IAdditionalColumnDesc} from '../../desc';
import {array_diff} from '../../internal/LineUpSelectionHelper';
import {ISelectionColumn, IContext} from '../ISelectionAdapter';

export function patchDesc(desc: IAdditionalColumnDesc, selectedId: number) {
  desc.selectedId = selectedId;
  return desc;
}

export abstract class ABaseSelectionAdapter {

  protected addDynamicColumns(context: IContext, _ids: number[], ids: string[]): void {
    Promise.all(_ids.map((_id, i) => this.createColumnsFor(context, _id, ids[i]))).then((columns) => {
      context.add([].concat(...columns));
    });
  }

  private removeDynamicColumns(context: IContext, _ids: number[]): void {
    const columns = context.columns;
    context.remove([].concat(..._ids.map((_id) => {
      context.freeColor(_id);
      return columns.filter((d) => (<IAdditionalColumnDesc>d.desc).selectedId === _id);
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

    // remove deselected columns
    if (diffRemoved.length > 0) {
      //console.log('remove columns', diffRemoved);
      this.removeDynamicColumns(context, diffRemoved);
    }
    // add new columns to the end
    if (diffAdded.length > 0) {
      //console.log('add columns', diffAdded);
      context.selection.idtype.unmap(diffAdded).then((names) => this.addDynamicColumns(context, diffAdded, names));
    }
  }

  protected abstract createColumnsFor(context: IContext, _id: number, id: string): Promise<ISelectionColumn[]>;
}

export default ABaseSelectionAdapter;
