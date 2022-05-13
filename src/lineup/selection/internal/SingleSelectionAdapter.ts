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

  protected parameterChangedImpl(context: IContext) {
    // remove all and start again
    const selectedIds = context.selection.ids;
    const usedCols = context.columns.filter((d) => (<IAdditionalColumnDesc>d.desc).selectedId != null);
    const lineupColIds = usedCols.map((d) => (<IAdditionalColumnDesc>d.desc).selectedId);

    // remove deselected columns
    if (lineupColIds.length > 0) {
      this.removeDynamicColumns(context, lineupColIds);
    }
    // add new columns to the end
    if (selectedIds.length <= 0) {
      return null;
    }
    return this.addDynamicColumns(context, selectedIds);
  }

  protected createColumnsFor(context: IContext, id: string): PromiseLike<ISelectionColumn[]> {
    return Promise.resolve(this.adapter.createDesc(id)).then((desc) => [
      {
        desc: ABaseSelectionAdapter.patchDesc(desc, id),
        data: this.adapter.loadData(id),
        id,
      },
    ]);
  }
}
