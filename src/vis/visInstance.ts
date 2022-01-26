import {IPersistable} from '../base/IPersistable';
import {UniqueIdManager} from '../app/UniqueIdManager';
import {IDataType} from '../data/datatype';
import {IEventHandler, EventHandler} from '../base/event';
import {ITransform} from './ITransform';
import {ILocateAble} from './ILocateAble';

export interface IVisInstanceOptions {
  rotate?: number;
  scale?: [number, number];
}

/**
 * basic interface of an visualization instance
 */
export interface IVisInstance extends IPersistable, IEventHandler, ILocateAble {
  /**
   * the unique id of this vis instance
   */
  readonly id: number;

  /**
   * the base element of this vis
   */
  readonly node: Element;

  /**
   * the represented data
   */
  readonly data: IDataType;

  /**
   * current size of this vis
   * @returns [width, height]
   */
  readonly size: [number, number];

  /**
   * the size without transformation applied
   */
  readonly rawSize: [number, number];

  /**
   * flag whether the vis if fully built, if not wait for the 'ready' event
   */
  readonly isBuilt: boolean;

  /**
   * returns the current transformation
   */
  transform(): ITransform;

  /**
   * sets the transformation
   * @param scale [w,h]
   * @param rotate
   */
  transform(scale: [number, number], rotate: number): ITransform;

  /**
   * option getter
   * @param name
   */
  option(name: string): any;

  /**
   * option setter
   * @param name
   * @param value
   */
  option(name: string, value: any): any;

  /**
   * updates this vis
   */
  update(): void;

  /**
   * destroy this vis and deregister handlers,...
   */
  destroy(): void;
}

/**
 * base class for an visualization
 */
export class AVisInstance extends EventHandler {
  readonly id = UniqueIdManager.getInstance().uniqueId('vis');
  private _built = false;

  option(name: string, value?: any): any {
    //dummy
    //if (value) {
    //  this.fire('option', name, value, null);
    //}
    return null;
  }

  persist(): any {
    return null;
  }

  get isBuilt() {
    return this._built;
  }

  protected markReady(built: boolean = true) {
    this._built = built;
    if (built) {
      this.fire('ready');
    }
  }

/* 

  locate(...selectionIds: string[][]): Promise<any> {
    if (selectionIds.length === 1) {
      return this.locateImpl(selectionIds[0]);
    }
    return Promise.all(selectionIds.map((sel) => this.locateImpl(sel)));
  }

  // TODO: is this correct?
  async locateById(...selectionIndices: string[][]) {
    const ids: string[] = await this.data.ids();
    if (selectionIndices.length === 1) {
      return this.locateImpl(selectionIndices[0]);
    }
    return Promise.all(selectionIndices.map((r) => this.locateImpl(r)));
  } */

  locate(...range: Range[]): Promise<any> {
    if (range.length === 1) {
      return this.locateImpl(range[0]);
    }
    return Promise.all(range.map(this.locateImpl, this));
  }

  async locateById(...range: Range[]) {
    const ids: Range = await (<any>this).data.ids();
    if (range.length === 1) {
      return this.locateImpl(ids.indexOf(range[0]));
    }
    return Promise.all(range.map((r) => this.locateImpl(ids.indexOf(r))));
  }

  locateImpl(selectionIndices: string[]) {
    //no resolution by default
    return Promise.resolve(null);
  }

  restore(persisted: any): Promise<AVisInstance> {
    return Promise.resolve(this);
  }

  update() {
    //do nothing
  }

  destroy() {
    // nothing to destroy
    const n = (<any>this).node;
    const w = n ? n.ownerDocument.defaultView : null;
    if (n && n.parentNode && !(w && w.event && w.event.type === 'DOMNodeRemoved' && w.event.target === n)) {
      n.parentNode.removeChild(n);
    }
    this.fire('destroyed');
  }

  transform(): ITransform {
    return {
      scale: [1, 1],
      rotate: 0
    };
  }

  get rawSize() {
    return [100, 100];
  }

  get size(): [number, number] {
    const t = this.transform();
    const r = this.rawSize;
    //TODO rotation
    return [r[0] * t.scale[0], r[1] * t.scale[1]];
  }
}
