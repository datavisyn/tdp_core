import { IVisPluginDesc } from '../../provvis/IVisPluginDesc';

export class FormUtils {
  /**
   * @internal
   */
  static selectVis(initial: number | string | IVisPluginDesc, visses: IVisPluginDesc[]) {
    switch (typeof initial) {
      case 'number':
        return visses[Math.max(0, Math.min(<number>initial, visses.length - 1))];
      case 'string':
        return visses[
          Math.max(
            0,
            visses.findIndex((v) => v.id === <string>initial),
          )
        ];
      default:
        return visses[Math.max(0, visses.indexOf(<IVisPluginDesc>initial))];
    }
  }

  /**
   * @internal
   */
  static clearNode(parent: Element) {
    let node = parent.firstChild;
    // eslint-disable-next-line no-cond-assign
    while ((node = parent.firstChild) != null) {
      parent.removeChild(node);
    }
  }

  /**
   * @internal
   */
  static createNode(parent: HTMLElement, type = 'div', clazz?: string) {
    const node = parent.ownerDocument.createElement(type);
    if (clazz) {
      clazz.split(' ').forEach((c) => node.classList.add(c));
    }
    parent.appendChild(node);
    return node;
  }
}
