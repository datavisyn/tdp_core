import { isEqual } from 'lodash';
import { IDType, IDTypeManager } from 'visyn_core/idtype';
import { PluginRegistry } from 'visyn_core/plugin';
import { UserSession } from 'visyn_core/security';
import { IBaseViewPluginDesc } from 'visyn_core/base';
import {
  EXTENSION_POINT_TDP_VIEW,
  EXTENSION_POINT_VISYN_VIEW,
  EXTENSION_POINT_TDP_LIST_FILTERS,
  EXTENSION_POINT_TDP_INSTANT_VIEW,
  EXTENSION_POINT_TDP_VIEW_GROUPS,
} from '../base/extensions';
import type { IViewContext, ISelection, IViewPluginDesc, IInstanceViewExtensionDesc, IViewGroupExtensionDesc, IGroupData } from '../base/interfaces';
import type { IObjectRef, ProvenanceGraph } from '../clue/provenance';
import { IPluginDesc } from '../base/plugin';

export interface IGroupedViews<T extends IBaseViewPluginDesc> extends IGroupData {
  views: T[];
}

export class ViewUtils {
  /**
   * event when one or more elements are selected for the next level
   * @type {string}
   * @argument selection {ISelection}
   */
  public static readonly VIEW_EVENT_ITEM_SELECT = 'select';

  public static readonly VIEW_EVENT_UPDATE_ENTRY_POINT = 'update_entry_point';

  public static readonly VIEW_EVENT_LOADING_FINISHED = 'loadingFinished';

  public static readonly VIEW_EVENT_UPDATE_SHARED = 'updateShared';

  static toViewPluginDesc<ReturnType extends IViewPluginDesc = IViewPluginDesc>(p: IPluginDesc): ReturnType {
    const r: any = p;
    r.selection = r.selection || 'none';
    r.group = { name: 'Other', order: 99, ...r.group };
    r.securityNotAllowedText = r.securityNotAllowedText != null ? r.securityNotAllowedText : false;

    // common typo
    if (r.idType !== undefined) {
      r.idtype = r.idType;
    }
    return r;
  }

  static matchLength(s: any, length: number) {
    switch (String(s)) {
      case '':
      case 'none':
      case '0':
        return length === 0;
      case 'any':
        return true;
      case 'single':
      case '1':
      case 'small_multiple':
        return length === 1;
      case 'multiple':
      case 'chooser':
      case 'some':
        return length >= 1;
      case '2':
        return length === 2;
      default:
        return false;
    }
  }

  /**
   * whether the view should be used as small multiple in case of multiple selections
   * @param desc
   * @returns {boolean}
   */
  static showAsSmallMultiple(desc: any) {
    return desc.selection === 'small_multiple';
  }

  /**
   * whether the view is going to use a chooser for multiple selections
   * @param desc
   * @returns {boolean}
   */
  static willShowChooser(desc: any) {
    return desc.selection === 'chooser';
  }

  /**
   * compares two selections and return true if they are the same
   * @param {ISelection} a
   * @param {ISelection} b
   * @returns {boolean}
   */
  static isSameSelection(a: ISelection, b: ISelection): boolean {
    const aNull = a == null || a.idtype == null;
    const bNull = b == null || b.idtype == null;
    if (aNull || bNull) {
      return aNull === bNull;
    }
    const base = a.idtype.id === b.idtype.id && isEqual(a.ids?.slice()?.sort(), b.ids?.slice()?.sort());
    if (!base) {
      return false;
    }
    const aAllSize = a.all ? a.all.size : 0;
    const bAllSize = b.all ? b.all.size : 0;
    if (aAllSize !== bAllSize) {
      return undefined;
    }
    if (aAllSize === 0) {
      return true;
    }
    // same size but not empty check entries
    return Array.from(a.all!.entries()).every(([key, value]) => {
      const other = b.all.get(key);
      if (!other) {
        return false;
      }

      return isEqual(value?.slice()?.sort(), other?.slice()?.sort());
    });
  }

  static createContext(graph: ProvenanceGraph, desc: IPluginDesc, ref: IObjectRef<any>): IViewContext {
    return {
      graph,
      desc: ViewUtils.toViewPluginDesc(desc),
      ref,
    };
  }

  /**
   * finds for the given IDType and selection matching views
   * @param {IDType} idType the idtype to lookfor
   * @param {string[]} selection the current input selection
   * @returns {Promise<IViewPluginDesc[]>} list of views and whether the current selection count matches their requirements
   */
  static findViews(idType: IDType, selection: string[]): Promise<IViewPluginDesc[]> {
    const selectionLength = selection.length;

    function bySelection(p: any) {
      return ViewUtils.matchLength(p.selection, selectionLength) || (ViewUtils.showAsSmallMultiple(p) && selectionLength > 1);
    }

    return ViewUtils.findViewBase(idType, PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_TDP_VIEW), true).then((r) => {
      return r
        .map(ViewUtils.toViewPluginDesc)
        .map((v) => {
          const access = ViewUtils.canAccess(v);
          const sel = bySelection(v);
          const hasAccessHint = !access && Boolean(v.securityNotAllowedText);
          return {
            ...v,
            enabled: access && sel,
            disabledReason: !access ? (hasAccessHint ? <const>'security' : <const>'invalid') : !sel ? <const>'selection' : undefined,
          };
        })
        .filter((v) => v.disabledReason !== 'invalid');
    });
  }

  static findAllViews(idType?: IDType): Promise<(IViewPluginDesc & { enabled: boolean })[]> {
    return ViewUtils.findViewBase(idType || null, PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_TDP_VIEW), true).then((r) => {
      return r
        .map(ViewUtils.toViewPluginDesc)
        .map((v) => {
          const access = ViewUtils.canAccess(v);
          const hasAccessHint = !access && Boolean(v.securityNotAllowedText);
          return {
            ...v,
            enabled: access,
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
    return ViewUtils.findViewBase(idType, PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_TDP_INSTANT_VIEW), false).then((r) =>
      r.filter(ViewUtils.canAccess),
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

  static groupByCategory<Desc extends IBaseViewPluginDesc>(views: Desc[]): IGroupedViews<Desc>[] {
    const grouped = new Map<string, Desc[]>();
    views.forEach((elem) => {
      if (!grouped.has(elem.group.name)) {
        grouped.set(elem.group.name, [elem]);
      } else {
        grouped.get(elem.group.name).push(elem);
      }
    });

    const sortView = (a: Desc, b: Desc, members?: string[]) => {
      // members attribute has priority
      if (members) {
        const indexA = members.indexOf(a.name);
        const indexB = members.indexOf(b.name);
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

      const orderA = a.group.order;
      const orderB = b.group.order;
      if (orderA === orderB) {
        return ViewUtils.caseInsensitiveCompare(a.name, b.name);
      }
      return orderA - orderB;
    };

    const sortGroup = (a: { name: string; order: number }, b: { name: string; order: number }) => {
      const orderA = a.order;
      const orderB = b.order;
      if (orderA === orderB) {
        return ViewUtils.caseInsensitiveCompare(a.name, b.name);
      }
      return orderA - orderB;
    };

    const groupData = ViewUtils.resolveGroupData();

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
