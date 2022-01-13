import { IPluginDesc } from '../base';
import { IViewPluginDesc, IViewContext, ISelection } from '../base/interfaces';
import { IObjectRef, ProvenanceGraph } from '../provenance';

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

  static toViewPluginDesc(p: IPluginDesc): IViewPluginDesc {
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
    const base = a.idtype.id === b.idtype.id && a.range.eq(b.range);
    if (!base) {
      return false;
    }
    const aAllSize = a.all ? a.all.size : 0;
    const bAllSize = b.all ? b.all.size : 0;
    if (aAllSize !== bAllSize) {
      return;
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
      return value.eq(other);
    });
  }

  static createContext(graph: ProvenanceGraph, desc: IPluginDesc, ref: IObjectRef<any>): IViewContext {
    return {
      graph,
      desc: ViewUtils.toViewPluginDesc(desc),
      ref,
    };
  }
}
