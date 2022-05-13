import { ABaseSelectionAdapter } from './ABaseSelectionAdapter';
import { IContext, ISelectionColumn } from '../ISelectionAdapter';
import { IAdditionalColumnDesc, IScoreRow } from '../../../base/interfaces';

export interface ISingleSelectionAdapter {
  /**
   * create the column description for the given selection
   * @param {string} id the id
   * @returns {Promise<IAdditionalColumnDesc>} the created description
   */
  createDesc(id: string): Promise<IAdditionalColumnDesc> | IAdditionalColumnDesc;

  /**
   * loads the score data for the given selection
   * @param {string} id the id
   * @returns {Promise<IScoreRow<any>[]>} data
   */
  loadData(id: string): Promise<IScoreRow<any>[]>;
}

export class SingleSelectionAdapter extends ABaseSelectionAdapter {
  constructor(private readonly adapter: ISingleSelectionAdapter) {
    super();
  }

  protected async parameterChangedImpl(context: IContext): Promise<void> {
    // TODO check if why it is necessary to remove **all** dynamic columns on parameter change and if it can be refactored so that it works the same as `MultiSelectionAdapter.parameterChangedImpl()`
    // remove **all** dynamic columns and start again
    const selectedIds = context.selection.ids;
    const usedCols = context.columns.filter((d) => (<IAdditionalColumnDesc>d.desc).selectedId != null);
    const lineupColIds = usedCols.map((d) => (<IAdditionalColumnDesc>d.desc).selectedId);

    // remove deselected columns
    if (lineupColIds.length > 0) {
      await this.removeDynamicColumns(context, lineupColIds);
    }
    // add new columns to the end
    if (selectedIds.length <= 0) {
      return null;
    }
    return this.addDynamicColumns(context, selectedIds);
  }

  /**
   * Creates a single column desc with additional metadata for a given selected id.
   *
   * @param context selection adapter context
   * @param id id of the selected item
   * @returns A promise with a list containing a single columns + additional metadata
   */
  protected async createColumnsFor(_context: IContext, id: string): Promise<ISelectionColumn[]> {
    const desc = await this.adapter.createDesc(id);
    return [
      {
        desc: ABaseSelectionAdapter.patchDesc(desc, id),
        data: this.adapter.loadData(id),
        id,
      },
    ];
  }
}
