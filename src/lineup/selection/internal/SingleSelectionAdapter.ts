/**
 * Created by Samuel Gratzl on 29.01.2016.
 */
import {ABaseSelectionAdapter} from './ABaseSelectionAdapter';
import {IContext, ISelectionAdapter} from '../ISelectionAdapter';
import {IAdditionalColumnDesc} from '../../../base/interfaces';
import {IScoreRow} from '../../../base/interfaces';
import {ResolveNow} from 'phovea_core';

export interface ISingleSelectionAdapter {
  /**
   * create the column description for the given selection
   * @param {number} _id the internal unique number
   * @param {string} id the associated name of the unique id
   * @returns {Promise<IAdditionalColumnDesc>} the created description
   */
  createDesc(_id: number, id: string): Promise<IAdditionalColumnDesc> | IAdditionalColumnDesc;

  /**
   * loads the score data for the given selection
   * @param {number} _id the internal unique number
   * @param {string} id the associated name of the unique id
   * @returns {Promise<IScoreRow<any>[]>} data
   */
  loadData(_id: number, id: string): Promise<IScoreRow<any>[]>;
}

export class SingleSelectionAdapter extends ABaseSelectionAdapter implements ISelectionAdapter {
  constructor(private readonly adapter: ISingleSelectionAdapter) {
    super();
  }

  protected parameterChangedImpl(context: IContext) {
    // remove all and start again
    const selectedIds = context.selection.range.dim(0).asList();
    const usedCols = context.columns.filter((d) => (<IAdditionalColumnDesc>d.desc).selectedId !== -1 && (<IAdditionalColumnDesc>d.desc).selectedId !== undefined);
    const lineupColIds = usedCols.map((d) => (<IAdditionalColumnDesc>d.desc).selectedId);

    // remove deselected columns
    if (lineupColIds.length > 0) {
      this.removeDynamicColumns(context, lineupColIds);
    }
    // add new columns to the end
    if (selectedIds.length <= 0) {
      return null;
    }
    return context.selection.idtype.unmap(selectedIds).then((names) => this.addDynamicColumns(context, selectedIds, names));
  }

  protected createColumnsFor(context: IContext, _id: number, id: string) {
    return ResolveNow.resolveImmediately(this.adapter.createDesc(_id, id)).then((desc) => [{
      desc: ABaseSelectionAdapter.patchDesc(desc, _id),
      data: this.adapter.loadData(_id, id),
      id: _id
    }]);
  }
}
