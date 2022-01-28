import { ViewUtils } from './ViewUtils';
import {
  EXTENSION_POINT_TDP_LIST_FILTERS,
  EXTENSION_POINT_TDP_INSTANT_VIEW,
  EXTENSION_POINT_TDP_VIEW,
  EXTENSION_POINT_TDP_VIEW_GROUPS,
} from '../base/extensions';
import { IGroupData, IInstanceViewExtensionDesc, IViewGroupExtensionDesc, IViewPluginDesc } from '../base/interfaces';
import { IDType, IDTypeManager } from '../idtype';
import { PluginRegistry, UserSession } from '../app';
import { IPluginDesc } from '../base';

export interface IDiscoveredView {
  enabled: boolean;
  v: IViewPluginDesc;
  disabledReason?: 'selection' | 'security' | 'invalid';
}

export interface IGroupedViews<T extends { v: IViewPluginDesc }> extends IGroupData {
  views: T[];
}

export class FindViewUtils {
  /**
   * finds for the given IDType and selection matching views
   * @param {IDType} idType the idtype to lookfor
   * @param {string[]} selection the current input selection
   * @returns {Promise<IDiscoveredView[]>} list of views and whether the current selection count matches their requirements
   */
  static findViews(idType: IDType, selection: string[]): Promise<IDiscoveredView[]> {
    const selectionLength = selection.length;

    function bySelection(p: any) {
      return ViewUtils.matchLength(p.selection, selectionLength) || (ViewUtils.showAsSmallMultiple(p) && selectionLength > 1);
    }

    return FindViewUtils.findViewBase(idType, PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_TDP_VIEW), true).then((r) => {
      return r
        .map(ViewUtils.toViewPluginDesc)
        .map((v) => {
          const access = FindViewUtils.canAccess(v);
          const sel = bySelection(v);
          const hasAccessHint = !access && Boolean(v.securityNotAllowedText);
          return {
            enabled: access && sel,
            v,
            disabledReason: !access ? (hasAccessHint ? <const>'security' : <const>'invalid') : !sel ? <const>'selection' : undefined,
          };
        })
        .filter((v) => v.disabledReason !== 'invalid');
    });
  }

  static findAllViews(idType?: IDType): Promise<IDiscoveredView[]> {
    return FindViewUtils.findViewBase(idType || null, PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_TDP_VIEW), true).then((r) => {
      return r
        .map(ViewUtils.toViewPluginDesc)
        .map((v) => {
          const access = FindViewUtils.canAccess(v);
          const hasAccessHint = !access && Boolean(v.securityNotAllowedText);
          return {
            enabled: access,
            v,
            disabledReason: !access ? (hasAccessHint ? <const>'security' : <const>'invalid') : undefined,
          };
        })
        .filter((v) => v.disabledReason !== 'invalid');
    });
  }

  private static async findViewBase(idType: IDType | null, views: IPluginDesc[], hasSelection: boolean) {
    const byTypeChecker = async () => {
      const mappedTypes = await IDTypeManager.getInstance().getCanBeMappedTo(idType);
      const all = [idType].concat(mappedTypes);

      return (p: any) => {
        const idT = p.idType !== undefined ? p.idType : p.idtype;
        const pattern = idT ? new RegExp(idT) : /.*/;
        return all.some((i) => pattern.test(i.id)) && (!hasSelection || p.selection === 'any' || !ViewUtils.matchLength(p.selection, 0));
      };
    };

    const byType = idType ? await byTypeChecker() : () => true;

    // execute extension filters
    const filters = await Promise.all(
      PluginRegistry.getInstance()
        .listPlugins(EXTENSION_POINT_TDP_LIST_FILTERS)
        .map((plugin) => plugin.load()),
    );

    function extensionFilters(p: IPluginDesc) {
      const f = p.filter || {};
      return filters.every((filter) => filter.factory(f));
    }

    return views.filter((p) => byType(p) && extensionFilters(p)).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
  }

  static canAccess(p: any) {
    let { security } = p;
    if (security === undefined) {
      return true;
    }
    if (typeof security === 'string') {
      const role = security;
      security = (user) => user.roles.indexOf(role) >= 0;
    }
    if (typeof security === 'function') {
      const user = UserSession.getInstance().currentUser();
      if (!user) {
        return false;
      }
      return security(user);
    }
    if (typeof security === 'boolean') {
      if (security === true) {
        // if security is set on a view with a boolean flag check if the user is at least logged in
        return UserSession.getInstance().isLoggedIn();
      }
      return true; // security is disabled - the resource is publicly available, the user can access it
    }
    return true;
  }

  static findInstantViews(idType: IDType): Promise<IInstanceViewExtensionDesc[]> {
    return FindViewUtils.findViewBase(idType, PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_TDP_INSTANT_VIEW), false).then((r) =>
      r.filter(FindViewUtils.canAccess),
    );
  }

  private static caseInsensitiveCompare(a: string, b: string) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  }

  static resolveGroupData() {
    const plugins = <IViewGroupExtensionDesc[]>PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_TDP_VIEW_GROUPS);
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

  /**
   * groups the given views
   * @param {T[]} views
   * @returns {IGroupedViews[]}
   */
  static groupByCategory<T extends { v: IViewPluginDesc }>(views: T[]): IGroupedViews<T>[] {
    const grouped = new Map<string, T[]>();
    views.forEach((elem) => {
      if (!grouped.has(elem.v.group.name)) {
        grouped.set(elem.v.group.name, [elem]);
      } else {
        grouped.get(elem.v.group.name).push(elem);
      }
    });

    const sortView = (a: { v: IViewPluginDesc }, b: { v: IViewPluginDesc }, members?: string[]) => {
      // members attribute has priority
      if (members) {
        const indexA = members.indexOf(a.v.name);
        const indexB = members.indexOf(b.v.name);
        if (indexA >= 0 && indexB >= 0) {
          return indexA - indexB;
        }
        if (indexA >= 0) {
          return -1;
        }
        if (indexB >= 0) {
          return 1;
        }
      }

      const orderA = a.v.group.order;
      const orderB = b.v.group.order;
      if (orderA === orderB) {
        return FindViewUtils.caseInsensitiveCompare(a.v.name, b.v.name);
      }
      return orderA - orderB;
    };

    const sortGroup = (a: { name: string; order: number }, b: { name: string; order: number }) => {
      const orderA = a.order;
      const orderB = b.order;
      if (orderA === orderB) {
        return FindViewUtils.caseInsensitiveCompare(a.name, b.name);
      }
      return orderA - orderB;
    };

    const groupData = FindViewUtils.resolveGroupData();

    const groups = Array.from(grouped).map(([name, v]) => {
      let base = groupData.get(name);
      if (!base) {
        base = { name, label: name, description: '', order: 900 };
      }

      const sortedViews = v.sort((a, b) => sortView(a, b, base.members));
      return Object.assign(base, { views: sortedViews });
    });
    return groups.sort(sortGroup);
  }
}
