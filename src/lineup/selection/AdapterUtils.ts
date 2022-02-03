import { ISelectionAdapter } from './ISelectionAdapter';
import { SingleSelectionAdapter, ISingleSelectionAdapter } from './internal/SingleSelectionAdapter';
import { MultiSelectionAdapter, IMultiSelectionAdapter } from './internal/MultiSelectionAdapter';

export class AdapterUtils {
  /**
   * create a single selection adapter, i.e. that one selected item results in one additional column in LineUp
   * @param {ISingleSelectionAdapter} adapter for loading and creating of those columns
   * @returns {ISelectionAdapter}
   */
  static single(adapter: ISingleSelectionAdapter): ISelectionAdapter {
    return new SingleSelectionAdapter(adapter);
  }

  /**
   * create a multi selection adapter, i.e that one selected item results in N additional columsn in LineUp
   * @param {IMultiSelectionAdapter} adapter adapter for loading and creating of those columns
   * @returns {ISelectionAdapter}
   */
  static multi(adapter: IMultiSelectionAdapter): ISelectionAdapter {
    return new MultiSelectionAdapter(adapter);
  }

  /**
   * no columns for selected items
   * @returns {ISelectionAdapter}
   */
  static none(): ISelectionAdapter {
    return {
      parameterChanged: () => undefined,
      selectionChanged: () => undefined,
    };
  }
}
