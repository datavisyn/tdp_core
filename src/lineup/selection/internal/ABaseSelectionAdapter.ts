import { ResolveNow } from '../../../base';
import { IAdditionalColumnDesc } from '../../../base/interfaces';
import { LineupUtils } from '../../utils';
import { ISelectionColumn, IContext, ISelectionAdapter } from '../ISelectionAdapter';

export abstract class ABaseSelectionAdapter implements ISelectionAdapter {
  protected addDynamicColumns(context: IContext, ids: string[]) {
    return Promise.all(ids.map((id) => this.createColumnsFor(context, id))).then((columns) => {
      // sort new columns to insert them in the correct order
      const flattenedColumns = [].concat(...columns).map((d, i) => ({ d, i }));
      flattenedColumns.sort(({ d: a, i: ai }, { d: b, i: bi }) => {
        if (a.position === b.position) {
          // equal position, sort latter element of original array to lower position in sorted array
          return bi - ai; // the latter in the array the better
        }
        return b.position - a.position; // sort descending by default
      });
      context.add(flattenedColumns.map((d) => d.d));
    });
  }

  protected removeDynamicColumns(context: IContext, _ids: string[]): void {
    const { columns } = context;
    context.remove(
      [].concat(
        ..._ids.map((_id) => {
          context.freeColor(_id);
          return columns.filter((d) => (<IAdditionalColumnDesc>d.desc).selectedId === _id);
        }),
      ),
    );
  }

  private waitingForSelection: PromiseLike<any> | null = null;

  private waitingForParameter: PromiseLike<any> | null = null;

  selectionChanged(waitForIt: PromiseLike<any> | null, context: () => IContext) {
    if (this.waitingForSelection) {
      return this.waitingForSelection;
    }
    return (this.waitingForSelection = ResolveNow.resolveImmediately(waitForIt)
      .then(() => this.selectionChangedImpl(context()))
      .then(() => {
        this.waitingForSelection = null;
      }));
  }

  parameterChanged(waitForIt: PromiseLike<any> | null, context: () => IContext) {
    if (this.waitingForSelection) {
      return this.waitingForSelection;
    }
    if (this.waitingForParameter) {
      return this.waitingForParameter;
    }
    return (this.waitingForParameter = ResolveNow.resolveImmediately(waitForIt)
      .then(() => {
        if (this.waitingForSelection) {
          return undefined; // abort selection more important
        }
        return this.parameterChangedImpl(context());
      })
      .then(() => {
        this.waitingForParameter = null;
      }));
  }

  protected abstract parameterChangedImpl(context: IContext): PromiseLike<any>;

  protected selectionChangedImpl(context: IContext) {
    const selectedIds = context.selection.selectionIds;
    const usedCols = context.columns.filter((d) => (<IAdditionalColumnDesc>d.desc).selectedId != null);
    const lineupColIds = usedCols.map((d) => (<IAdditionalColumnDesc>d.desc).selectedId);

    // compute the difference
    const diffAdded = LineupUtils.array_diff(selectedIds, lineupColIds);
    const diffRemoved = LineupUtils.array_diff(lineupColIds, selectedIds);

    // remove deselected columns
    if (diffRemoved.length > 0) {
      // console.log('remove columns', diffRemoved);
      this.removeDynamicColumns(context, diffRemoved);
    }
    // add new columns to the end
    if (diffAdded.length <= 0) {
      return null;
    }
    return this.addDynamicColumns(context, diffAdded);
  }

  protected abstract createColumnsFor(context: IContext, _id: string): PromiseLike<ISelectionColumn[]>;

  static patchDesc(desc: IAdditionalColumnDesc, selectedId: string) {
    desc.selectedId = selectedId;
    return desc;
  }
}
