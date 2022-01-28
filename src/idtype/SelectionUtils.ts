import { isEqual } from 'lodash';

export enum SelectOperation {
  SET,
  ADD,
  REMOVE,
}

export class SelectionUtils {
  public static defaultSelectionType = 'selected';

  public static hoverSelectionType = 'hovered';

  /**
   * converts the given mouse event to a select operation
   * @param event the mouse event to examine
   */
  static toSelectOperation(event: MouseEvent): SelectOperation;
  /**
   * converts the given key modifiers to select operation
   * @param ctryKey
   * @param altKey
   * @param shiftKey
   * @param metaKey
   */
  static toSelectOperation(ctryKey: boolean, altKey: boolean, shiftKey: boolean, metaKey: boolean): SelectOperation;
  static toSelectOperation(event: any) {
    let ctryKeyDown;
    let shiftDown;
    let altDown;
    let metaDown;
    if (typeof event === 'boolean') {
      ctryKeyDown = event;
      // eslint-disable-next-line prefer-rest-params
      altDown = arguments[1] || false;
      // eslint-disable-next-line prefer-rest-params
      shiftDown = arguments[2] || false;
      // eslint-disable-next-line prefer-rest-params
      metaDown = arguments[3] || false;
    } else {
      ctryKeyDown = event.ctrlKey || false;
      altDown = event.altKey || false;
      shiftDown = event.shiftKey || false;
      metaDown = event.metaKey || false;
    }
    if (ctryKeyDown || shiftDown) {
      return SelectOperation.ADD;
    }
    if (altDown || metaDown) {
      return SelectOperation.REMOVE;
    }
    return SelectOperation.SET;
  }

  static asSelectOperation(v: any) {
    if (!v) {
      return SelectOperation.SET;
    }
    if (typeof v === 'string') {
      switch (v.toLowerCase()) {
        case 'add':
          return SelectOperation.ADD;
        case 'remove':
          return SelectOperation.REMOVE;
        default:
          return SelectOperation.SET;
      }
    }
    return +v;
  }

  static integrateSelection(current: string[], next: string[], op: SelectOperation = SelectOperation.SET): string[] {
    if (op === SelectOperation.SET) {
      return next;
    }
    if (SelectOperation.ADD) {
      return Array.from(new Set([...current, ...next]));
    }
    if (SelectOperation.REMOVE) {
      return current.filter((s) => !next.includes(s));
    }
    return [];
  }

  static selectionEq(as: string[], bs: string[]) {
    return isEqual(as?.sort(), bs?.sort());
  }
}
