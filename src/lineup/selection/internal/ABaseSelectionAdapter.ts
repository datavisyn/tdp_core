/**
 * Created by Samuel Gratzl on 29.01.2016.
 */
import {IAdditionalColumnDesc} from '../../desc';
import {array_diff} from '../../internal/LineUpSelectionHelper';
import {ISelectionColumn, IContext} from '../ISelectionAdapter';
import {resolveImmediately} from 'phovea_core/src/internal/promise';

export function patchDesc(desc: IAdditionalColumnDesc, selectedId: number) {
  desc.selectedId = selectedId;
  return desc;
}

export abstract class ABaseSelectionAdapter {

  protected addDynamicColumns(context: IContext, _ids: number[], ids: string[]): void {
    Promise.all(_ids.map((_id, i) => this.createColumnsFor(context, _id, ids[i]))).then((columns) => {
      // sort new columns to insert them in the correct order
      const flattenedColumns = [].concat(...columns);
      flattenedColumns.sort((a, b) => {
        if(a.position === b.position) { // equal position, sort latter element of original array to lower position in sorted array
          return 1;
        }
        return b.position - a.position; // sort descendingly by default
      });
      context.add(flattenedColumns);
    });
  }

  private removeDynamicColumns(context: IContext, _ids: number[]): void {
    const columns = context.columns;
    context.remove([].concat(..._ids.map((_id) => {
      context.freeColor(_id);
      return columns.filter((d) => (<IAdditionalColumnDesc>d.desc).selectedId === _id);
    })));
  }

  private selectionChangedTimer = -1;
  private parameterChangedTimer = -1;

  selectionChanged(waitForIt: PromiseLike<any>|null, context: () => IContext) {
    // wait for the promise and then a debounce logic
    resolveImmediately(waitForIt).then(() => {
      if (this.selectionChangedTimer >= 0) {
        clearTimeout(this.selectionChangedTimer);
        this.selectionChangedTimer = -1;
      }
      this.selectionChangedTimer = <any>setTimeout(() => {
        this.selectionChangedImpl(context());
      }, 100);
    });
  }

  parameterChanged(waitForIt: PromiseLike<any>|null, context: () => IContext) {
    resolveImmediately(waitForIt).then(() => {
      if (this.parameterChangedTimer >= 0) {
        clearTimeout(this.parameterChangedTimer);
        this.parameterChangedTimer = -1;
      }
      this.parameterChangedTimer = <any>setTimeout(() => {
        this.parameterChangedImpl(context());
      }, 100);
    });
  }

  protected abstract parameterChangedImpl(context: IContext): void;

  protected selectionChangedImpl(context: IContext) {
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

  protected abstract createColumnsFor(context: IContext, _id: number, id: string): PromiseLike<ISelectionColumn[]>;
}

export default ABaseSelectionAdapter;
