import { IPluginDesc } from 'visyn_core/plugin';

import { IVisMetaData } from './IVisMetaData';
import { IDataType } from '../../data/datatype';

/**
 * formal description of the interface of a plugin description
 */
export interface IVisPluginDesc extends IPluginDesc, IVisMetaData {
  /**
   * determines whether the given data can be represented using this visualization technique
   * @param data
   */
  filter(data: IDataType): boolean;

  /**
   * add all icon information of this vis to the given html element
   * @param node
   */
  iconify(node: HTMLElement): HTMLElement;
}
