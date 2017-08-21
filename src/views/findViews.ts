/**
 * Find views for a given idtype and number of selected items.
 * The seleted items itself are not considered in this function.
 * @param idtype
 * @param selection
 * @returns {any}
 */


import IDType from 'phovea_core/src/idtype/IDType';
import {IViewPluginDesc, matchLength, showAsSmallMultiple, toViewPluginDesc} from './interfaces';
import {
  EXTENSION_POINT_TDP_DISABLE_VIEW,
  EXTENSION_POINT_TDP_LIST_FILTERS,
  EXTENSION_POINT_TDP_VIEW
} from '../extensions';
import {IPluginDesc, list as listPlugins} from 'phovea_core/src/plugin';
import Range from 'phovea_core/src/range/Range';

/**
 * finds for the given IDType and selection matching views
 * @param {IDType} idtype the idtype to lookfor
 * @param {Range} selection the current input selection
 * @returns {Promise<{enabled: boolean; v: IViewPluginDesc}[]>} list of views and whether the current selection count matches their requirements
 */
export default async function findViews(idtype: IDType, selection: Range): Promise<{ enabled: boolean, v: IViewPluginDesc }[]> {
  if (idtype === null) {
    return Promise.resolve([]);
  }
  const selectionLength = selection.isNone ? 0 : selection.dim(0).length;

  const mappedTypes = await idtype.getCanBeMappedTo();
  const all = [idtype].concat(mappedTypes);

  function byType(p: any) {
    const pattern = p.idtype ? new RegExp(p.idtype) : /.*/;
    return all.some((i) => pattern.test(i.id)) && !matchLength(p.selection, 0);
  }

  //disable certain views based on another plugin
  const disabler = listPlugins(EXTENSION_POINT_TDP_DISABLE_VIEW).map((p: any) => new RegExp(p.filter));

  function disabled(p: IPluginDesc) {
    return disabler.some((re) => re.test(p.id));
  }

  function bySelection(p: any) {
    return (matchLength(p.selection, selectionLength) || (showAsSmallMultiple(p) && selectionLength > 1));
  }

  // execute extension filters
  const filters = await Promise.all(listPlugins(EXTENSION_POINT_TDP_LIST_FILTERS).map((plugin) => plugin.load()));

  function extensionFilters(p: IPluginDesc) {
    const f = p.filter || {};
    return filters.every((filter) => filter.factory(f));
  }

  return listPlugins(EXTENSION_POINT_TDP_VIEW)
    .filter((p) => byType(p) && !disabled(p) && extensionFilters(p))
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    .map((v) => ({enabled: bySelection(v), v: toViewPluginDesc(v)}));
}


