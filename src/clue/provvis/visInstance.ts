import { IEventHandler, EventHandler } from 'visyn_core/base';
import { IPersistable } from '../../base/IPersistable';
import { UniqueIdManager } from '../../app/UniqueIdManager';
import { IDataType } from '../../data/datatype';
import { ITransform } from './ITransform';

export interface IVisInstanceOptions {
  rotate?: number;
  scale?: [number, number];
}

/**
 * basic interface of an visualization instance
 */
export interface IVisInstance extends IPersistable, IEventHandler {
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
    // dummy
    // if (value) {
    //  this.fire('option', name, value, null);
    // }
    return null;
  }

  persist(): any {
    return null;
  }

  get isBuilt() {
    return this._built;
  }

  protected markReady(built = true) {
    this._built = built;
    if (built) {
      this.fire('ready');
    }
  }

  restore(persisted: any): Promise<AVisInstance> {
    return Promise.resolve(this);
  }

  update() {
    // do nothing
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
      rotate: 0,
    };
  }

  get rawSize() {
    return [100, 100];
  }

  get size(): [number, number] {
    const t = this.transform();
    const r = this.rawSize;
    // TODO rotation
    return [r[0] * t.scale[0], r[1] * t.scale[1]];
  }
}
