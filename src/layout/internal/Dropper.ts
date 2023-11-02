import { ALayoutContainer, ILayoutContainerOption } from './ALayoutContainer';
import { TabbingLayoutContainer } from './TabbingLayoutContainer';
import { SplitLayoutContainer } from './SplitLayoutContainer';
import { EOrientation, IDropArea, ILayoutContainer } from '../interfaces';
import { AParentLayoutContainer } from './AParentLayoutContainer';
import { LineUpLayoutContainer } from './LineUpLayoutContainer';
import { DnDUtils } from '../../app';

export class Dropper {
  static determineDropArea(x: number, y: number): IDropArea {
    if (x > 0.2 && x < 0.4 && y > 0.3 && y < 0.7) {
      return 'horizontal-scroll';
    }
    if (x > 0.6 && x < 0.8 && y > 0.3 && y < 0.7) {
      return 'vertical-scroll';
    }
    if (x < 0.2) {
      return 'left';
    }
    if (x > 0.8) {
      return 'right';
    }
    if (y < 0.3) {
      return 'top';
    }
    if (y > 0.7) {
      return 'bottom';
    }
    return 'center';
  }

  static dropViews(node: HTMLElement, reference: ALayoutContainer<any> & ILayoutContainer) {
    node.dataset.drop = 'center';

    node.insertAdjacentHTML(
      'beforeend',
      `
      <div class="phovea-drop-locations-overlay">
        <div></div>
        <div></div>
        <div></div>
      </div>
    `,
    );

    DnDUtils.getInstance().dropAble(
      node,
      [ALayoutContainer.MIME_TYPE],
      (result, e) => {
        const area = Dropper.determineDropArea(e.offsetX / node.offsetWidth, e.offsetY / node.offsetHeight);
        const id = parseInt(result.data[ALayoutContainer.MIME_TYPE], 10);
        console.assert(reference.parent != null);
        const item = reference.parent.rootParent.find(id);
        if (item === null) {
          return false;
        }
        return Dropper.dropLogic(item, reference, area);
      },
      (e) => {
        node.dataset.drop = Dropper.determineDropArea(e.offsetX / node.offsetWidth, e.offsetY / node.offsetHeight);
      },
      true,
    );
  }

  static dropLogic(item: ILayoutContainer, reference: (ALayoutContainer<any> & ILayoutContainer) | TabbingLayoutContainer, area: IDropArea) {
    if (item instanceof AParentLayoutContainer && reference.parents.indexOf(item) >= 0) {
      // can drop item within one of its children
      return false;
    }
    const { parent } = reference;
    const canDirectly = parent.canDrop(area);
    if (canDirectly) {
      if (parent.children.indexOf(item) < 0 && item !== reference) {
        return parent.place(item, reference, area); // tod
      }
      return false; // already a child
    }
    if (area === 'center' && item !== reference) {
      // replace myself with a tab container
      const p = new TabbingLayoutContainer(item.node.ownerDocument, {});
      parent.replace(reference, p);
      p.push(reference);
      p.push(item);
      p.active = item;
      return true;
    }
    // corner case if I'm the child of a tabbing, tab that and not me
    if (parent instanceof TabbingLayoutContainer && !(area === 'horizontal-scroll' || area === 'vertical-scroll')) {
      return Dropper.dropLogic(item, parent, area);
    }

    if (<AParentLayoutContainer<ILayoutContainerOption>>parent === reference || item === reference) {
      // can't split my parent with my parent
      return false;
    }

    if (area === 'horizontal-scroll' || area === 'vertical-scroll') {
      const orientation = area === 'horizontal-scroll' ? EOrientation.HORIZONTAL : EOrientation.VERTICAL;
      const p = new LineUpLayoutContainer(item.node.ownerDocument, {
        orientation,
        stackLayout: true,
      });
      parent.replace(reference, p);
      p.push(reference);
      p.push(item);
      return true;
    }

    // replace myself with a split container
    const p = new SplitLayoutContainer(item.node.ownerDocument, {
      orientation: area === 'left' || area === 'right' ? EOrientation.HORIZONTAL : EOrientation.VERTICAL,
      name: area === 'left' || area === 'top' ? `${item.name}|${reference.name}` : `${reference.name}|${item.name}`,
    });
    parent.replace(reference, p);
    if (area === 'left' || area === 'top') {
      p.push(Dropper.autoWrap(item), -1, 0.5);
      p.push(reference, -1, 0.5);
    } else {
      p.push(reference, -1, 0.5);
      p.push(Dropper.autoWrap(item), -1, 0.5);
    }
    // force ratios
    p.ratios = [0.5, 0.5];
    return true;
  }

  static autoWrap(item: ILayoutContainer) {
    if (item.autoWrapOnDrop) {
      return new TabbingLayoutContainer(item.node.ownerDocument, { name: typeof item.autoWrapOnDrop === 'string' ? item.autoWrapOnDrop : 'Side' }, item);
    }
    return item;
  }
}
