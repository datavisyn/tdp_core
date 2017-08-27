/**
 * Created by Samuel Gratzl on 29.01.2016.
 */
import {ABaseSelectionAdapter, patchDesc} from './ABaseSelectionAdapter';
import {IContext, ISelectionAdapter} from '../ISelectionAdapter';
import {IAdditionalColumnDesc} from '../../desc';
import {IScoreRow} from '../../';
import {resolveImmediately} from 'phovea_core/src';

export interface ISingleSelectionAdapter {
  /**
   * create the column description for the given selection
   * @param {number} _id the internal unique number
   * @param {string} id the associated name of the unique id
   * @returns {Promise<IAdditionalColumnDesc>} the created description
   */
  createDesc(_id: number, id: string): Promise<IAdditionalColumnDesc>|IAdditionalColumnDesc;

  /**
   * loads the score data for the given selection
   * @param {number} _id the internal unique number
   * @param {string} id the associated name of the unique id
   * @returns {Promise<IScoreRow<any>[]>} data
   */
  loadData(_id: number, id: string): Promise<IScoreRow<any>[]>;
}

export default class SingleSelectionAdapter extends ABaseSelectionAdapter implements ISelectionAdapter {
  constructor(private readonly adapter: ISingleSelectionAdapter) {
    super();
  }
  protected parameterChangedImpl() {
    // dummy
  }

  protected createColumnsFor(context: IContext, _id: number, id: string) {
    return resolveImmediately(this.adapter.createDesc(_id, id)).then((desc) => [{desc: patchDesc(desc, _id), data: this.adapter.loadData(_id, id), id: _id}]);
  }
}
