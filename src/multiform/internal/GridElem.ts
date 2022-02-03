import { BaseUtils } from '../../base/BaseUtils';
import { IPersistable } from '../../base/IPersistable';
import { IDataType, DataUtils } from '../../data';
import { IVisInstance, VisUtils, ITransform } from '../../vis';
import { Range } from '../../range';
import { IPlugin } from '../../base/plugin';
import { FormUtils } from './FormUtils';

/**
 * @internal
 */
export class GridElem implements IPersistable {
  actVis: IVisInstance;

  content: HTMLElement;

  constructor(public readonly range: Range, public readonly pos: number[], public readonly data: IDataType) {}

  setContent(c: HTMLElement) {
    this.content = c;
    DataUtils.assignData(this.content, this.data);
  }

  subrange(r: Range) {
    const ri = this.range.intersect(r);
    return this.range.indexOf(ri);
  }

  get hasOne() {
    return this.actVis != null;
  }

  destroy() {
    if (this.actVis && typeof this.actVis.destroy === 'function') {
      this.actVis.destroy();
    }
  }

  get size(): number[] {
    return this.actVis ? this.actVis.size : [100, 100];
  }

  get rawSize(): number[] {
    return this.actVis ? this.actVis.rawSize : [100, 100];
  }

  persist() {
    return {
      range: this.range.toString(),
      content: this.actVis && typeof this.actVis.persist === 'function' ? this.actVis.persist() : null,
    };
  }

  restore(persisted: any): any {
    // FIXME
    /* if (persisted.id) {
     var selected = search(this.visses, (e) => e.id === persisted.id);
     if (selected) {
     this.switchTo(selected).then((vis) => {
     if (vis && persisted.content && isFunction(restore)) {
     restore(persisted.content);
     }
     });
     }
     } */
    return null;
  }

  switchDestroy() {
    // remove content dom side
    FormUtils.clearNode(this.content);
    if (this.actVis && typeof this.actVis.destroy === 'function') {
      this.actVis.destroy();
    }
    this.actVis = null;
  }

  build(plugin: IPlugin, options: any) {
    this.actVis = plugin.factory(this.data, this.content, options);
    VisUtils.assignVis(this.content, this.actVis);
    return this.actVis;
  }

  get location() {
    const o = BaseUtils.offset(this.content);
    return {
      x: o.left,
      y: o.top,
    };
  }

  transform(scale?: [number, number], rotate?: number): ITransform {
    if (this.actVis) {
      if (arguments.length > 0) {
        return this.actVis.transform(scale, rotate);
      }
      return this.actVis.transform();
    }
    return {
      scale: [1, 1],
      rotate: 0,
    };
  }
}
