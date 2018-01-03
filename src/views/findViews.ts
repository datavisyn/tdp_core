/**
 * Find views for a given idtype and number of selected items.
 * The selected items itself are not considered in this function.
 * @param idtype
 * @param selection
 * @returns {any}
 */


import IDType from 'phovea_core/src/idtype/IDType';
import {IViewPluginDesc, matchLength, showAsSmallMultiple, toViewPluginDesc} from './interfaces';
import {
  EXTENSION_POINT_TDP_LIST_FILTERS,
  EXTENSION_POINT_TDP_VIEW, EXTENSION_POINT_TDP_VIEW_GROUPS, IGroupData, IViewGroupExtensionDesc
} from '../extensions';
import {IPluginDesc, list as listPlugins} from 'phovea_core/src/plugin';
import Range from 'phovea_core/src/range/Range';
import {currentUser} from 'phovea_core/src/security';

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
    return all.some((i) => pattern.test(i.id)) && (p.selection === 'any' || !matchLength(p.selection, 0));
  }

  function bySelection(p: any) {
    return (matchLength(p.selection, selectionLength) || (showAsSmallMultiple(p) && selectionLength > 1));
  }

  function canAccess(p: IPluginDesc) {
    let security = p.security;
    if (security === undefined) {
      return true;
    }
    if (typeof security === 'string') {
      const role = security;
      security = (user) => user.roles.indexOf(role) >= 0;
    }
    if (typeof security === 'function') {
      const user = currentUser();
      if (!user) {
        return false;
      }
      return security(user);
    }
    return true;
  }

  // execute extension filters
  const filters = await Promise.all(listPlugins(EXTENSION_POINT_TDP_LIST_FILTERS).map((plugin) => plugin.load()));

  function extensionFilters(p: IPluginDesc) {
    const f = p.filter || {};
    return filters.every((filter) => filter.factory(f));
  }

  return listPlugins(EXTENSION_POINT_TDP_VIEW)
    .filter((p) => byType(p) && extensionFilters(p) && canAccess(p))
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    .map((v) => ({enabled: bySelection(v), v: toViewPluginDesc(v)}));
}

function caseInsensitiveCompare(a: string, b: string) {
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

function resolveGroupData() {
  const plugins = <IViewGroupExtensionDesc[]>listPlugins(EXTENSION_POINT_TDP_VIEW_GROUPS);
  const r = new Map<string, IGroupData>();
  plugins.forEach((plugin) => {
    (plugin.groups || []).forEach((g) => {
      g.label = g.label || g.name;
      g.description = g.description || '';
      r.set(g.name, g);
    });
  });
  return r;
}

export interface IGroupedViews<T extends {v: IViewPluginDesc}> extends IGroupData {
  views: T[];
}

/**
 * groups the given views
 * @param {T[]} views
 * @returns {IGroupedViews[]}
 */
export function groupByCategory<T extends {v: IViewPluginDesc}>(views: T[]): IGroupedViews<T>[] {
  const grouped = new Map<string, T[]>();
  views.forEach((elem) => {
    if(!grouped.has(elem.v.group.name)) {
      grouped.set(elem.v.group.name, [elem]);
    } else {
      grouped.get(elem.v.group.name).push(elem);
    }
  });

  const sortView = (a: {v: IViewPluginDesc}, b: {v: IViewPluginDesc}) => {
    const orderA = a.v.group.order;
    const orderB = b.v.group.order;
    if (orderA === orderB) {
      return caseInsensitiveCompare(a.v.name, b.v.name);
    }
    return orderA - orderB;
  };

  const sortGroup = (a: {name: string, order: number}, b: {name: string, order: number}) => {
    const orderA = a.order;
    const orderB = b.order;
    if (orderA === orderB) {
      return caseInsensitiveCompare(a.name, b.name);
    }
    return orderA - orderB;
  };

  const groupData = resolveGroupData();

  const groups = Array.from(grouped).map(([name, views]) => {
    let base = groupData.get(name);
    if (!base) {
      base = {name, label: name, description: '', order: 900};
    }
    return Object.assign(base, {views: views.sort(sortView)});
  });
  return groups.sort(sortGroup);
}
