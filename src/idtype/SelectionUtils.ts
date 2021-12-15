import {ParseRangeUtils, Range, Range1D, RangeLike} from '../range';



export enum SelectOperation {
  SET, ADD, REMOVE
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
    let ctryKeyDown, shiftDown, altDown, metaDown;
    if (typeof event === 'boolean') {
      ctryKeyDown = event;
      altDown = arguments[1] || false;
      shiftDown = arguments[2] || false;
      metaDown = arguments[3] || false;
    } else {
      ctryKeyDown = event.ctrlKey || false;
      altDown = event.altKey || false;
      shiftDown = event.shiftKey || false;
      metaDown = event.metaKey || false;
    }
    if (ctryKeyDown || shiftDown) {
      return SelectOperation.ADD;
    } else if (altDown || metaDown) {
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
        case 'add' :
          return SelectOperation.ADD;
        case 'remove' :
          return SelectOperation.REMOVE;
        default :
          return SelectOperation.SET;
      }
    }
    return +v;
  }

  static fillWithNone(r: Range, ndim: number) {
    while (r.ndim < ndim) {
      r.dims[r.ndim] = Range1D.none();
    }
    return r;
  }

  static integrateSelection(current: Range, additional: RangeLike, operation: SelectOperation = SelectOperation.SET) {
    const next = ParseRangeUtils.parseRangeLike(additional);
    switch (operation) {
      case SelectOperation.ADD:
        return current.union(next);
      case SelectOperation.REMOVE:
        return current.without(next);
      default:
        return next;
    }
  }
}
