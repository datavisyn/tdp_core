

/**
 * Find views for a given idtype and number of selected items.
 * The seleted items itself are not considered in this function.
 * @param idtype
 * @param selection
 * @returns {any}
 */
export async function findViews(idtype:IDType, selection:Range) : Promise<{enabled: boolean, v: IViewPluginDesc}[]> {
  if (idtype === null) {
    return Promise.resolve([]);
  }
  const selectionLength = idtype === null || selection.isNone ? 0 : selection.dim(0).length;
  const mappedTypes = await idtype.getCanBeMappedTo();
  const all = [idtype].concat(mappedTypes);
  function byType(p: any) {
    const pattern = p.idtype ? new RegExp(p.idtype) : /.*/;
    return all.some((i) => pattern.test(i.id)) && !matchLength(p.selection, 0);
  }
  //disable certain views based on another plugin
  const disabler = listPlugins(TargidConstants.EXTENSION_POINT_DISABLE_VIEW).map((p: any) => new RegExp(p.filter));
  function disabled(p: IPluginDesc) {
    return disabler.some((re) => re.test(p.id));
  }
  function bySelection(p: any) {
    return (matchLength(p.selection, selectionLength) || (showAsSmallMultiple(p) && selectionLength > 1));
  }

  // execute extension filters
  const filters = await Promise.all(listPlugins(TargidConstants.FILTERS_EXTENSION_POINT_ID).map((plugin) => plugin.load()));
  function extensionFilters(p: IPluginDesc) {
    const f = p.filter || {};
    return filters.every((filter) => filter.factory(f));
  }

  return listPlugins(TargidConstants.VIEW)
    .filter((p) => byType(p) && !disabled(p) && extensionFilters(p))
    .sort((a,b) => d3.ascending(a.name.toLowerCase(), b.name.toLowerCase()))
    .map((v) => ({enabled: bySelection(v), v: toViewPluginDesc(v)}));
}


