import {Rect} from '../geom';

export interface ILayoutElem {
  setBounds(x: number, y: number, w: number, h: number): Promise<void>|null;

  getBounds(): Rect;

  layoutOption<T>(name: string): T;
  layoutOption<T>(name: string, defaultValue: T): T;
}

export interface ILayoutOptions {
  /**
   * preferred x position
   * default NaN
   */
  prefX?: number;
  /**
   * preferred y position
   * default NaN
   */
  prefY?: number;
  /**
   * preferred width
   * default NaN
   */
  prefWidth?: number;
  /**
   * preferred height
   * default NaN
   */
  prefHeight?: number;
  /**
   * border attachment for BorderLayout, possible values: center, top, left, right, bottom
   * default: center
   */
  border?: string;
}

export class ALayoutElem {
  constructor(private options: ILayoutOptions = {}) {

  }

  getBounds(): Rect {
    return Rect.rect(0, 0, 0, 0);
  }

  getLocation() {
    return this.getBounds().xy;
  }

  getSize() {
    return this.getBounds().size;
  }

  layoutOption<T>(name: string, defaultValue: T = null): T {
    if (this.options.hasOwnProperty(name)) {
      return (<any>this.options)[name];
    }
    return defaultValue;
  }
}

export interface IHTMLLayoutOptions extends ILayoutOptions {
  // px
  unit?: string;
}

class HTMLLayoutElem extends ALayoutElem implements ILayoutElem {
  constructor(private node: HTMLElement, options: IHTMLLayoutOptions = {}) {
    super(options);
  }

  setBounds(x: number, y: number, w: number, h: number): Promise<void>|null {
    const unit = this.layoutOption('unit', 'px'),
      style = this.node.style;
    style.left = x + unit;
    style.top = y + unit;
    style.width = w + unit;
    style.height = h + unit;
    return null;
  }

  getBounds() {
    const unit = this.layoutOption('unit', 'px'),
      style = this.node.style;

    function v(f: string) {
      if (f.length >= unit.length && f.substring(f.length - unit.length) === unit) {
        f = f.substring(0, f.length - unit.length);
        return parseFloat(f);
      }
      return 0;
    }

    return Rect.rect(v(style.left), v(style.top), v(style.width), v(style.height));
  }

  static wrapDOM(node: HTMLElement, options: any = {}) {
    return new HTMLLayoutElem(node, options);
  }


}

export interface IPadding {
  readonly top: number;
  readonly left: number;
  readonly right: number;
  readonly bottom: number;
}


export interface ILayout {
  (elems: ILayoutElem[], w: number, h: number, parent: ILayoutElem): Promise<boolean>;
}
