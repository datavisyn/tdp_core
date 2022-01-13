/** ****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
import { BaseUtils } from '../base/BaseUtils';
import { IDataType, DataUtils } from '../data';
import { AShape, Rect } from '../geom';
import { IVisMetaData, IVisInstance, IVisPluginDesc, AVisInstance, VisUtils, ITransform } from '../vis';
import { IMultiForm, IMultiFormOptions } from './IMultiForm';
import { VisChooser } from './VisChooser';
import { FormUtils, ProxyMetaData } from './internal/internal';
import { GridElem } from './internal/GridElem';
import { Range, CompositeRange1D, Range1DGroup, Range1D } from '../range';

function sum(arr: number[]) {
  return arr.reduce((v, x) => v + x, 0);
}

function max(arr: any[], acc: (row: any) => number) {
  if (arr.length === 0) {
    return NaN;
  }
  return arr.reduce((p, act) => Math.max(p, acc(act)), -Infinity);
}

export interface IViewFactory {
  (data: IDataType, range: Range, pos: number[]): IDataType;
}

export interface IMultiFormGridOptions extends IMultiFormOptions {
  singleRowOptimization?: boolean;
  wrap?(cell: HTMLElement, data: IDataType, range: Range, pos: number[]): HTMLElement;
}

/**
 * a simple multi form class using a select to switch
 */
export class MultiFormGrid extends AVisInstance implements IVisInstance, IMultiForm {
  readonly node: HTMLElement;

  /**
   * list of all possibles vis techniques
   */
  readonly visses: IVisPluginDesc[];

  private actDesc: IVisPluginDesc;

  private actVisPromise: Promise<any>;

  private content: HTMLElement;

  private dims: Range1DGroup[][];

  private grid: GridElem[];

  private _metaData: IVisMetaData = new ProxyMetaData(() => this.actDesc);

  constructor(
    public readonly data: IDataType,
    public readonly range: Range,
    parent: HTMLElement,
    viewFactory: IViewFactory,
    private options: IMultiFormGridOptions = {},
  ) {
    super();
    this.options = BaseUtils.mixin(
      {
        initialVis: 0,
        singleRowOptimization: true,
        filter: () => true,
      },
      options,
    );
    this.node = FormUtils.createNode(parent, 'div', 'multiformgrid');
    DataUtils.assignData(parent, data);
    VisUtils.assignVis(this.node, this);
    // find all suitable plugins
    this.visses = VisUtils.listVisPlugins(data).filter(this.options.filter);

    // compute the dimensions and build the grid
    const dims = (this.dims = range.dims.map((dim) => {
      if (dim instanceof CompositeRange1D) {
        return (<CompositeRange1D>dim).groups;
      }
      if (dim instanceof Range1DGroup) {
        return [<Range1DGroup>dim];
      }
      return [Range1DGroup.asUngrouped(dim)];
    }));
    const grid: GridElem[] = (this.grid = []);

    function product(level: number, ran: Range1D[], pos: number[]) {
      if (level === dims.length) {
        const r = ran.length === 0 ? Range.all() : Range.list(ran.slice()); // work on a copy for safety reason
        grid.push(new GridElem(r, pos.slice(), viewFactory(data, r, pos.slice())));
      } else {
        dims[level].forEach((group, i) => {
          ran.push(group);
          pos.push(i);
          product(level + 1, ran, pos);
          ran.pop();
          pos.pop();
        });
      }
    }

    product(0, [], []);

    this.build();
  }

  get dimSizes() {
    return this.dims.map((d) => d.length);
  }

  private toElem(pos: number[]) {
    const s = this.dimSizes;
    if (s.length === 1) {
      return this.grid[pos[0]];
    }
    return this.grid[pos[0] * s[1] + (pos[1] || 0)];
  }

  getRange(...indices: number[]) {
    const elem = this.toElem(indices);
    return elem.range;
  }

  getData(...indices: number[]) {
    const elem = this.toElem(indices);
    return elem.data;
  }

  getBounds(...indices: number[]) {
    const elem = this.toElem(indices);
    const absloc = elem.location;
    const { size } = elem;
    const parentLoc = BaseUtils.offset(this.content);

    return Rect.rect(absloc.x - parentLoc.left, absloc.y - parentLoc.top, size[0], size[1]);
  }

  /**
   * converts this multiform to a vis metadata
   * @return {IVisMetaData}
   */
  get asMetaData() {
    return this._metaData;
  }

  private build() {
    // create select option field

    // create content
    this.content = this.node;
    const wrap = this.options.wrap || ((d) => d);
    // create groups for all grid elems
    // TODO how to layout as a grid
    if (this.dims.length === 1) {
      if (this.options.singleRowOptimization) {
        this.grid.forEach((elem) => elem.setContent(wrap(FormUtils.createNode(this.node, 'div', 'content gridrow'), elem.data, elem.range, elem.pos)));
      } else {
        this.grid.forEach((elem) => {
          const n = FormUtils.createNode(this.node, 'div', 'gridrow');
          const nn = FormUtils.createNode(n, 'div', 'content');
          nn.style.display = 'inline-block';
          elem.setContent(wrap(nn, elem.data, elem.range, elem.pos));
        });
      }
    } else {
      const ndim = this.dimSizes;
      for (let i = 0; i < ndim[0]; ++i) {
        const row = FormUtils.createNode(this.node, 'div', 'gridrow');
        for (let j = 0; j < ndim[1]; ++j) {
          const elem = this.grid[i * ndim[1] + j];
          const nn = FormUtils.createNode(row, 'div', 'content');
          nn.style.display = 'inline-block';
          elem.setContent(wrap(nn, elem.data, elem.range, elem.pos));
        }
      }
    }
    // switch to first
    this.switchTo(this.options.initialVis);
  }

  destroy() {
    this.grid.forEach((elem) => elem.destroy());
    super.destroy();
  }

  transform(scale?: [number, number], rotate?: number): ITransform {
    if (this.grid[0].hasOne) {
      const bak = this.grid[0].transform();
      if (arguments.length > 0) {
        this.grid.forEach((g) => g.transform(scale, rotate));
        this.fire(
          'transform',
          {
            scale,
            rotate,
          },
          bak,
        );
      }
      return bak;
    }
    return {
      scale: [1, 1],
      rotate: 0,
    };
  }

  persist(): any {
    return {
      id: this.actDesc ? this.actDesc.id : null,
      contents: this.grid.map((elem) => elem.persist()),
    };
  }

  restore(persisted: any): Promise<MultiFormGrid> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    if (persisted.id) {
      const selected = this.visses.find((e) => e.id === persisted.id);
      if (selected) {
        return this.switchTo(selected).then((vis) => {
          // FIXME
          if (vis && persisted.content && typeof (<any>vis).restore === 'function') {
            return <Promise<MultiFormGrid>>Promise.resolve((<any>vis).restore(persisted.content)).then(() => that);
          }
          return Promise.resolve(that);
        });
      }
    }
    return Promise.resolve(that);
  }

  private locateGroup(range: Range) {
    if (range.isAll || range.isNone) {
      const s = this.size;
      return Promise.resolve(Rect.rect(0, 0, s[0], s[1]));
    }
    const parentLoc = BaseUtils.offset(this.content);

    function relativePos(pos: { x: number; y: number }) {
      return {
        x: pos.x - parentLoc.left,
        y: pos.y - parentLoc.top,
      };
    }

    const filterTo = () => {
      const inElems: { g: GridElem; pos: { x: number; y: number }; r: Range }[] = [];

      for (const g of this.grid) {
        const matched = g.subrange(range);

        if (!matched.isNone) {
          // direct group hit
          inElems.push({
            g,
            pos: relativePos(g.location),
            r: matched,
          });
        }
      }
      return inElems;
    };

    const inElems = filterTo();

    if (inElems.length === 1) {
      return inElems[0].g.actVis.locate(inElems[0].r).then((loc: AShape) => {
        return loc ? loc.shift(inElems[0].pos) : loc;
      });
    }
    return Promise.all<AShape>(inElems.map((elem) => elem.g.actVis.locate(elem.r))).then((locations: AShape[]) => {
      // shift the locations according to grid position
      locations = locations.map((loc, i) => (loc ? loc.shift(inElems[i].pos) : loc)).filter((loc) => loc != null);
      // merge into a single one
      const base = locations[0].aabb();
      let { x } = base;
      let { y } = base;
      let { x2 } = base;
      let { y2 } = base;
      locations.forEach((loc) => {
        const aab = loc.aabb();
        x = Math.min(x, aab.x);
        y = Math.min(y, aab.y);
        x2 = Math.min(x2, aab.x2);
        y2 = Math.min(y2, aab.y2);
      });
      return Promise.resolve(Rect.rect(x, y, x2 - x, y2 - y));
    });
  }

  locateGroupById(range: Range) {
    return this.data.ids().then((ids) => {
      return this.locateGroup(ids.indexOf(range));
    });
  }

  locate(...range: Range[]) {
    const p = this.actVisPromise || Promise.resolve(null);
    return p.then((visses) => {
      if (!visses) {
        return Promise.resolve(range.length === 1 ? undefined : new Array(range.length));
      }
      if (visses.length === 1) {
        return visses[0].locate.apply(visses[0], range);
      }
      // multiple groups
      if (range.length === 1) {
        return this.locateGroup(range[0]);
      }
      return Promise.all(range.map((arg) => this.locateGroup(arg)));
    });
  }

  locateById(...range: Range[]) {
    const p = this.actVisPromise || Promise.resolve(null);
    return p.then((visses) => {
      if (!visses) {
        return Promise.resolve(range.length === 1 ? undefined : new Array(range.length));
      }
      if (visses.length === 1) {
        return visses[0].locateById.apply(visses[0], range);
      }
      // multiple groups
      if (range.length === 1) {
        return this.locateGroupById(range[0]);
      }
      return Promise.all(range.map((arg) => this.locateGroupById(arg)));
    });
  }

  /**
   * returns the current selected vis technique description
   * @returns {plugins.IPluginDesc}
   */
  get act() {
    return this.actDesc;
  }

  get actLoader() {
    return this.actVisPromise;
  }

  gridSize(raw = false): { cols: number[]; rows: number[]; grid: number[][][] } {
    const sizes = this.grid.map(raw ? (elem) => elem.rawSize : (elem) => elem.size);

    if (this.dims.length === 1) {
      // vertically groups only
      return {
        cols: [<number>max(sizes, (s) => s[0])],
        rows: sizes.map((s) => s[1]),
        grid: sizes.map((s) => [s]),
      };
    }
    // if (this.dims.length === 2)
    const cols = this.dims[1].length;
    const grid = this.dims[0].map((row, i) => sizes.slice(i * cols, (i + 1) * cols));
    return {
      cols: this.dims[1].map((d, i) => <number>max(grid, (row) => row[i][0])),
      rows: grid.map((row) => <number>max(row, (s) => s[1])),
      grid,
    };
  }

  get size(): [number, number] {
    const gridSize = this.gridSize();
    return [sum(gridSize.cols), sum(gridSize.rows)];
  }

  get rawSize(): [number, number] {
    const gridSize = this.gridSize(true);
    return [sum(gridSize.cols), sum(gridSize.rows)];
  }

  /**
   * switch to the desired vis technique given by index
   * @param param
   */
  switchTo(param: string | number | IVisPluginDesc): Promise<IVisInstance[]> {
    const vis: IVisPluginDesc = FormUtils.selectVis(param, this.visses);

    if (vis === this.actDesc) {
      return this.actVisPromise; // already selected
    }

    // gracefully destroy
    this.grid.forEach((elem) => elem.switchDestroy());

    // switch and trigger event
    const bak = this.actDesc;
    this.actDesc = vis;
    this.markReady(false);
    this.fire('change', vis, bak);
    this.actVisPromise = null;

    if (vis) {
      // load the plugin and create the instance
      return (this.actVisPromise = vis.load().then((plugin: any) => {
        if (this.actDesc !== vis) {
          // changed in the meanwhile
          return null;
        }
        const options = BaseUtils.mixin({}, this.options.all, this.options[vis.id] || {});
        const r = this.grid.map((elem) => elem.build(plugin, options));
        let c = r.length;
        r.forEach((ri) => {
          ri.on('ready', () => {
            c--;
            if (c === 0) {
              // all built
              this.markReady();
            }
          });
        });
        this.fire('changed', vis, bak);
        return r;
      }));
    }
    return Promise.resolve([]);
  }

  addIconVisChooser(toolbar: HTMLElement) {
    return VisChooser.addIconVisChooser(toolbar, this);
  }

  addSelectVisChooser(toolbar: HTMLElement) {
    return VisChooser.addSelectVisChooser(toolbar);
  }

  static create(data: IDataType, range: Range, parent: HTMLElement, viewFactory: IViewFactory, options?: IMultiFormGridOptions) {
    return new MultiFormGrid(data, range, parent, viewFactory, options);
  }
}
