
import {IVisPluginDesc} from '../../vis/IVisPluginDesc';

export class FormUtils {

  /**
   * @internal
   */
  static selectVis(initial: number|string|IVisPluginDesc, visses: IVisPluginDesc[]) {
    switch (typeof initial) {
      case 'number':
        return visses[Math.max(0, Math.min(<number>initial, visses.length - 1))];
      case 'string':
        return visses[Math.max(0, visses.findIndex((v) => v.id === <string>initial))];
      default:
        return visses[Math.max(0, visses.indexOf(<IVisPluginDesc>initial))];
    }
  }

  /**
   * @internal
   */
  static clearNode(parent: Element) {
    let node = parent.firstChild;
    while ((node = parent.firstChild) != null) {
      parent.removeChild(node);
    }
  }
  /**
   * @internal
   */
  static createNode(parent: HTMLElement, type: string = 'div', clazz?: string) {
    const node = parent.ownerDocument.createElement(type);
    if (clazz) {
      clazz.split(' ').forEach((c) => node.classList.add(c));
    }
    parent.appendChild(node);
    return node;
  }
}
