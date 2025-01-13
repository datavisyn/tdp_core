import { EOrientation, IDropArea, ILayoutContainer, ILayoutDump, ISplitLayoutContainer, LayoutContainerEvents } from '../interfaces';
import { ALayoutContainer } from './ALayoutContainer';
import { ASequentialLayoutContainer, ISequentialLayoutContainerOptions } from './ASequentialLayoutContainer';

export class SplitLayoutContainer extends ASequentialLayoutContainer<ISequentialLayoutContainerOptions> implements ISplitLayoutContainer {
  private static readonly SEPARATOR = `<div data-layout="separator"><span title="Squeeze Left"></span><span title="Squeeze Right"></span></div>`;

  private static readonly SEPARATOR_WIDTH = 5;

  readonly minChildCount = 2;

  readonly type = 'split';

  private readonly _ratios: number[] = [];

  constructor(document: Document, options: Partial<ISequentialLayoutContainerOptions>, ratio?: number, child1?: ILayoutContainer, child2?: ILayoutContainer) {
    super(document, options);
    console.assert(ratio === undefined || (ratio >= 0 && ratio <= 1));
    this.node.dataset.layout = 'split';

    if (!this.options.fixed) {
      this.node.addEventListener('mousedown', (evt) => {
        if (this.isSeparator(<HTMLElement>evt.target)) {
          // dragging
          const index = Math.floor(Array.from(this.node.children).indexOf(<HTMLElement>evt.target) / 2);
          this.enableDragging(index);
        }
      });
    }

    if (ratio !== undefined) {
      console.assert(child1 != null && child2 != null);
      this.push(child1, -1, 1);
      this.push(child2, -1, (1 - ratio) / ratio);
    }
  }

  defaultOptions() {
    return Object.assign(super.defaultOptions());
  }

  place(child: ILayoutContainer, reference: ILayoutContainer, area: IDropArea) {
    console.assert(area !== 'center');
    const index = this._children.indexOf(reference) + (area === 'right' || area === 'bottom' ? 1 : 0);
    return this.push(child, index, 0.5);
  }

  private isSeparator(elem: HTMLElement) {
    return elem.parentElement === this.node && elem.dataset.layout === 'separator';
  }

  private enableDragging(index: number) {
    const bak = this._ratios.slice();
    const mouseMove = (evt: MouseEvent) => {
      const n = this.node;
      const bb = n.getBoundingClientRect();
      const x = evt.clientX - bb.left - n.clientLeft + n.scrollLeft;
      const y = evt.clientY - bb.top - n.clientTop + n.scrollTop;
      const ratio = this.options.orientation === EOrientation.HORIZONTAL ? x / n.offsetWidth : y / n.offsetHeight;
      this.setRatioImpl(index, ratio);
      // no events
      evt.stopPropagation();
      evt.preventDefault();
    };
    const disable = (evt: MouseEvent) => {
      if (evt.target !== evt.currentTarget && evt.type === 'mouseleave') {
        return;
      }
      this.node.classList.remove('slider-dragging');
      this.node.removeEventListener('mousemove', mouseMove);
      this.node.removeEventListener('mouseup', disable);
      this.node.removeEventListener('mouseleave', disable);
      const act = this._ratios.slice();
      if (!bak.every((b, i) => act[i] === b)) {
        // changed fire event just once
        this.fire(ALayoutContainer.withChanged(LayoutContainerEvents.EVENT_CHANGE_SPLIT_RATIOS), bak, act);
      }
    };

    this.node.classList.add('slider-dragging');
    this.node.addEventListener('mousemove', mouseMove);
    this.node.addEventListener('mouseup', disable);
    this.node.addEventListener('mouseleave', disable);
  }

  setRatio(index: number, ratio: number) {
    const bak = this._ratios.slice();
    this.setRatioImpl(index, ratio);
    this.fire(ALayoutContainer.withChanged(LayoutContainerEvents.EVENT_CHANGE_SPLIT_RATIOS), bak, this._ratios.slice());
  }

  private setRatioImpl(index: number, ratio: number) {
    console.assert(ratio >= 0 && ratio <= 1);
    const bak = this._ratios.slice();

    if (index === 0 || index >= this.length - 2) {
      if (index > 0 && index === this.length - 2) {
        // easier to manipulate the last then the 2nd last
        index += 1;
        ratio = 1 - ratio;
      }
      // corner cases
      const old = this._ratios[index];
      const others = this._ratios.reduce((a, r) => a + r, -old);
      if (others > 0) {
        const factor = (others + (old - ratio)) / others;
        this._ratios.forEach((r, i) => (this._ratios[i] = r * factor));
      } else {
        // even
        this._ratios.forEach((r, i) => (this._ratios[i] = (1 - ratio) / (this._ratios.length - 1)));
      }
      this._ratios[index] = ratio;
      this.updateRatios();
      return;
    }
    // we want that the left sum is our ratio
    const left = this._ratios.slice(0, index + 1);
    const before = left.reduce((a, r) => a + r, 0);
    const factorBefore = ratio / before;
    if (factorBefore > 0) {
      left.forEach((r, i) => (this._ratios[i] = r * factorBefore));
    } else {
      left.forEach((r, i) => (this._ratios[i] = (1 - ratio) / left.length));
    }
    const right = this._ratios.slice(index + 1);
    const after = right.reduce((a, r) => a + r, 0);
    const factorAfter = (1 - ratio) / after;
    if (factorAfter > 0) {
      right.forEach((r, i) => (this._ratios[i + index + 1] = r * factorAfter));
    } else {
      right.forEach((r, i) => (this._ratios[i + index + 1] = ratio / right.length));
    }
    this.updateRatios();
  }

  private squeeze(separator: HTMLElement, dir: 'left' | 'right') {
    const index = Math.floor(Array.from(this.node.children).indexOf(separator) / 2);
    this.setRatio(index + (dir === 'right' ? 1 : 0), 0);
  }

  private updateRatios() {
    const sum = this._ratios.reduce((a, r) => a + r, 0);
    this._ratios.forEach((r, i) => (this._ratios[i] = r / sum)); // normalize
    const act = this._ratios.map((r) => Math.round(r * 100));
    this.forEach((c, i) => {
      const wrapper = c.node.parentElement.style;
      wrapper.flex = `${act[i]} ${act[i]} 0`;
      wrapper.display = act[i] <= 1 ? 'none' : null;
      c.resized();
    });
  }

  get ratios() {
    return this._ratios.slice();
  }

  set ratios(values: number[]) {
    console.assert(values.length === this._ratios.length);
    this._ratios.splice(0, this._ratios.length, ...values);
    this.updateRatios();
  }

  protected getPadding() {
    return (this.length - 1) * SplitLayoutContainer.SEPARATOR_WIDTH;
  }

  push(child: ILayoutContainer, index = -1, ratio = 0) {
    const r = super.push(child, index);
    if (index < 0 || index >= this._children.length - 1) {
      this._ratios.push(ratio);
    } else {
      // assume we are in the replace mode and compute the missing ratio
      this._ratios.splice(index, 0, ratio);
    }
    this.updateRatios();
    return r;
  }

  protected addedChild(child: ILayoutContainer, index: number) {
    super.addedChild(child, index);
    if (index < 0 || index >= this.length - 1) {
      // +1 since we already changed the children
      this.node.appendChild(ASequentialLayoutContainer.wrap(child));
    } else if (index === 0) {
      // assume we are in the replace mode
      this.node.insertBefore(ASequentialLayoutContainer.wrap(child), this.node.firstChild);
    } else {
      // assume we are in the replace mode -> consider separator
      this.node.insertBefore(ASequentialLayoutContainer.wrap(child), this._children[index + 1].node.parentElement.previousSibling);
    }
    if (this.length > 1) {
      this.node.insertAdjacentHTML('beforeend', SplitLayoutContainer.SEPARATOR);
      const separator = this.node.lastElementChild;
      if (!this.options.fixed) {
        separator.firstElementChild.addEventListener('click', (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          this.squeeze(<HTMLElement>separator, 'left');
        });
        separator.lastElementChild.addEventListener('click', (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          this.squeeze(<HTMLElement>separator, 'right');
        });
      } else {
        separator.classList.add('fixed');
      }
      if (index > 0) {
        this.node.insertBefore(separator, child.node.parentElement);
      } else {
        this.node.insertBefore(separator, child.node.parentElement.nextSibling);
      }
    }
    child.visible = this.visible;
  }

  replace(child: ILayoutContainer, replacement: ILayoutContainer) {
    const index = this._children.indexOf(child);
    console.assert(index >= 0);
    const ratio = this._ratios[index];
    this.takeDownChild(child);
    this.setupChild(replacement);
    this._children.splice(index, 1, replacement);
    this.addedChild(replacement, index);
    this.updateRatios();
    return true;
  }

  protected takeDownChild(child: ILayoutContainer) {
    const wrapper = child.node.parentElement;
    // in case of the first one use the next one since the next child is going to be the first one
    const separator = wrapper.previousElementSibling || wrapper.nextElementSibling;
    if (separator) {
      separator.remove();
    }
    wrapper.remove();
    super.takeDownChild(child);
  }

  remove(child: ILayoutContainer) {
    const index = this._children.indexOf(child);
    this._ratios.splice(index, 1);
    const r = super.remove(child);
    this.updateRatios();
    return r;
  }

  persist() {
    return Object.assign(super.persist(), {
      type: 'split',
      ratios: this.ratios.map((r) => Math.round(r * 100) / 100), // round to 2 digits
      fixedLayout: this.options.fixedLayout,
    });
  }

  static restore(dump: ILayoutDump, restore: (dump: ILayoutDump) => ILayoutContainer, doc: Document) {
    console.assert(dump.children.length >= 2);
    const { ratios } = dump;
    const options = Object.assign(ALayoutContainer.restoreOptions(dump), {
      orientation: EOrientation[<string>dump.orientation],
      fixedLayout: dump.fixedLayout === true,
    });
    const r = new SplitLayoutContainer(doc, options, ratios[0], restore(dump.children[0]), restore(dump.children[1]));
    dump.children.slice(2).forEach((d, i) => r.push(restore(d), ratios[i + 2]));
    // force specific ratios
    r.ratios = ratios;
    return r;
  }

  static derive(node: HTMLElement, derive: (node: HTMLElement) => ILayoutContainer) {
    const children = Array.from(node.children);
    console.assert(children.length >= 2);

    const deriveOrientation = () => {
      if (node.dataset.layout.startsWith('v') || (node.dataset.orientation && node.dataset.orientation.startsWith('v'))) {
        return EOrientation.VERTICAL;
      }
      return EOrientation.HORIZONTAL;
    };
    const deriveRatios = () => {
      const ratio = node.dataset.ratio ? parseFloat(node.dataset.ratio) : NaN;
      if (!Number.isNaN(ratio)) {
        const rest = 1 - ratio;
        const r = [ratio];
        for (let i = 1; i < children.length; ++i) {
          r.push(rest / (children.length - 1));
        }
        return r;
      }
      const ratios = node.dataset.ratios ? node.dataset.ratios.split(' ').map((d) => parseFloat(d)) : [];
      if (ratios.every((d) => !Number.isNaN(d))) {
        if (ratios.length < children.length) {
          const sum = ratios.reduce((a, b) => a + b, 0);
          const missing = children.length - ratios.length;
          for (let i = 0; i < missing; ++i) {
            ratios.push((1 - sum) / missing);
          }
        }
        return ratios.slice(0, children.length);
      }
      // generate uniform
      return children.map((_) => 1 / children.length);
    };

    const options = Object.assign(ALayoutContainer.deriveOptions(node), {
      orientation: deriveOrientation(),
      fixedLayout: Boolean(node.dataset.fixedLayout),
    });
    const ratios = deriveRatios();
    const r = new SplitLayoutContainer(node.ownerDocument, options);
    children.forEach((c: HTMLElement) => r.push(derive(c)));
    r.ratios = ratios;
    return r;
  }
}
