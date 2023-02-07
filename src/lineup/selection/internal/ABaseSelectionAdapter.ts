import { difference } from 'lodash';
import { IAdditionalColumnDesc } from '../../../base/interfaces';
import { ISelectionColumn, IContext, ISelectionAdapter } from '../ISelectionAdapter';

export abstract class ABaseSelectionAdapter implements ISelectionAdapter {
  protected async addDynamicColumns(context: IContext, ids: string[]): Promise<void> {
    const columns = await Promise.all(ids.map((id) => this.createColumnsFor(context, id)));

    // sort new columns to insert them in the correct order
    const flattenedColumns = [].concat(...columns).map((d, i) => ({ d, i }));
    flattenedColumns.sort(({ d: a, i: ai }, { d: b, i: bi }) => {
      if (a.position === b.position) {
        // equal position, sort latter element of original array to lower position in sorted array
        return bi - ai; // the latter in the array the better
      }
      return b.position - a.position; // sort descending by default
    });
    return context.add(flattenedColumns.map((d) => d.d));
  }

  protected removeDynamicColumns(context: IContext, ids: string[]): Promise<void> {
    const { columns } = context;
    return context.remove(
      [].concat(
        ...ids.map((id) => {
          context.freeColor(id);
          return columns.filter((d) => (<IAdditionalColumnDesc>d.desc).selectedId === id);
        }),
      ),
    );
  }

  /**
   * Add or remove columns in LineUp ranking when the selected items in the selection adapter context change
   * @param context selection adapter context
   * @returns A promise that can waited for until the columns have been changed.
   */
  selectionChanged(context: IContext, onContextChanged?: (context: IContext) => void): Promise<void | IContext> {
    return this.selectionChangedImpl(context, onContextChanged);
  }

  /**
   * Add or remove columns in LineUp ranking when the parametrs in the selection adapter context change
   * @param context selection adapter context
   * @returns A promise that can waited for until the columns have been changed.
   */
  parameterChanged(context: IContext, onContextChanged?: (context: IContext) => void): Promise<IContext | void> {
    return this.parameterChangedImpl(context, onContextChanged);
  }

  // TODO test at run-time if we really need the following promises or if it can be removed. it might be necessary when replaying the a CLUE provenence graph. if we need it, a queue might be the better solution.
  // private waitingForSelection: Promise<any> | null = null;

  // private waitingForParameter: Promise<any> | null = null;

  // /**
  //  * Add or remove columns in LineUp ranking when the selected items in the selection adapter context change
  //  * @param waitForIt additional promise to wait (e.g., wait for view to be loaded) before continuing
  //  * @param context selection adapter context
  //  * @returns A promise that can waited for until the columns have been changed.
  //  */
  // selectionChanged(waitForIt: Promise<any> | null, context: IContext): Promise<any> {
  //   if (this.waitingForSelection) {
  //     return this.waitingForSelection;
  //   }

  //   return (this.waitingForSelection = Promise.resolve(waitForIt)
  //     .then(() => this.selectionChangedImpl(context))
  //     .then(() => {
  //       this.waitingForSelection = null;
  //     }));
  // }

  // /**
  //  * Add or remove columns in LineUp ranking when the parametrs in the selection adapter context change
  //  * @param waitForIt additional promise to wait (e.g., wait for view to be loaded) before continuing
  //  * @param context selection adapter context
  //  * @returns A promise that can waited for until the columns have been changed.
  //  */
  // parameterChanged(waitForIt: Promise<any> | null, context: IContext): Promise<any> {
  //   if (this.waitingForSelection) {
  //     return this.waitingForSelection;
  //   }
  //   if (this.waitingForParameter) {
  //     return this.waitingForParameter;
  //   }
  //   return (this.waitingForParameter = Promise.resolve(waitForIt)
  //     .then(() => {
  //       if (this.waitingForSelection) {
  //         return undefined; // abort selection more important
  //       }
  //       return this.parameterChangedImpl(context);
  //     })
  //     .then(() => {
  //       this.waitingForParameter = null;
  //     }));
  // }

  protected abstract parameterChangedImpl(context: IContext, onContextChanged?: (context: IContext) => void | IContext): Promise<void | IContext>;

  protected async selectionChangedImpl(context: IContext, onContextChanged?: (context: IContext) => void): Promise<void | IContext> {
    const selectedIds = context.selection.ids;
    const usedCols = context.columns.filter((d) => (<IAdditionalColumnDesc>d.desc).selectedId != null);
    const lineupColIds = usedCols.map((d) => (<IAdditionalColumnDesc>d.desc).selectedId);

    // compute the difference
    const diffAdded = difference(selectedIds, lineupColIds);
    const diffRemoved = difference(lineupColIds, selectedIds);
    // remove deselected columns
    if (diffRemoved.length > 0) {
      await this.removeDynamicColumns(context, diffRemoved);
    }
    // add new columns to the end
    if (diffAdded.length) {
      await this.addDynamicColumns(context, diffAdded);
    }

    return onContextChanged?.(context);
  }

  /**
   * Create a column desc with additional metadata for a given selected id.
   *
   * The function is marked as abstract, because based on the implementation one or multiple columns
   * can be added for the given id.
   *
   * @param context selection adapter context
   * @param id id of the selected item
   * @returns A promise with the list of columns + additional metadata
   */
  protected abstract createColumnsFor(context: IContext, id: string): Promise<ISelectionColumn[]>;

  // TODO this function is currently useless, because it requires an `IAdditionalColumnDesc` where `selectedId` is mandatory and then assigns it again
  static patchDesc(desc: IAdditionalColumnDesc, selectedId: string): IAdditionalColumnDesc {
    // FIXME avoid mutation of original desc
    desc.selectedId = selectedId;
    return desc;
  }
}
