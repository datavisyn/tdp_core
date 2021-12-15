/******************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 *****************************************************************************/
import { BaseUtils } from '../base/BaseUtils';
import { DataUtils } from '../data';
import { Rect } from '../geom';
import { AVisInstance, VisUtils } from '../vis';
import { VisChooser } from './VisChooser';
import { FormUtils, ProxyMetaData } from './internal/internal';
import { GridElem } from './internal/GridElem';
import { Range, CompositeRange1D, Range1DGroup } from '../range';
function sum(arr) {
    return arr.reduce((v, x) => v + x, 0);
}
function max(arr, acc) {
    if (arr.length === 0) {
        return NaN;
    }
    return arr.reduce((p, act) => Math.max(p, acc(act)), -Infinity);
}
/**
 * a simple multi form class using a select to switch
 */
export class MultiFormGrid extends AVisInstance {
    constructor(data, range, parent, viewFactory, options = {}) {
        super();
        this.data = data;
        this.range = range;
        this.options = options;
        this._metaData = new ProxyMetaData(() => this.actDesc);
        this.options = BaseUtils.mixin({
            initialVis: 0,
            singleRowOptimization: true,
            filter: () => true
        }, options);
        this.node = FormUtils.createNode(parent, 'div', 'multiformgrid');
        DataUtils.assignData(parent, data);
        VisUtils.assignVis(this.node, this);
        //find all suitable plugins
        this.visses = VisUtils.listVisPlugins(data).filter(this.options.filter);
        //compute the dimensions and build the grid
        const dims = this.dims = range.dims.map((dim) => {
            if (dim instanceof CompositeRange1D) {
                return dim.groups;
            }
            else if (dim instanceof Range1DGroup) {
                return [dim];
            }
            else {
                return [Range1DGroup.asUngrouped(dim)];
            }
        });
        const grid = this.grid = [];
        function product(level, range, pos) {
            if (level === dims.length) {
                const r = range.length === 0 ? Range.all() : Range.list(range.slice()); //work on a copy for safety reason
                grid.push(new GridElem(r, pos.slice(), viewFactory(data, r, pos.slice())));
            }
            else {
                dims[level].forEach((group, i) => {
                    range.push(group);
                    pos.push(i);
                    product(level + 1, range, pos);
                    range.pop();
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
    toElem(pos) {
        const s = this.dimSizes;
        if (s.length === 1) {
            return this.grid[pos[0]];
        }
        return this.grid[pos[0] * s[1] + (pos[1] || 0)];
    }
    getRange(...indices) {
        const elem = this.toElem(indices);
        return elem.range;
    }
    getData(...indices) {
        const elem = this.toElem(indices);
        return elem.data;
    }
    getBounds(...indices) {
        const elem = this.toElem(indices);
        const absloc = elem.location;
        const size = elem.size;
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
    build() {
        //create select option field
        //create content
        this.content = this.node;
        const wrap = this.options.wrap || ((d) => d);
        //create groups for all grid elems
        //TODO how to layout as a grid
        if (this.dims.length === 1) {
            if (this.options.singleRowOptimization) {
                this.grid.forEach((elem) => elem.setContent(wrap(FormUtils.createNode(this.node, 'div', 'content gridrow'), elem.data, elem.range, elem.pos)));
            }
            else {
                this.grid.forEach((elem) => {
                    const n = FormUtils.createNode(this.node, 'div', 'gridrow');
                    const nn = FormUtils.createNode(n, 'div', 'content');
                    nn.style.display = 'inline-block';
                    elem.setContent(wrap(nn, elem.data, elem.range, elem.pos));
                });
            }
        }
        else {
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
        //switch to first
        this.switchTo(this.options.initialVis);
    }
    destroy() {
        this.grid.forEach((elem) => elem.destroy());
        super.destroy();
    }
    transform(scale, rotate) {
        if (this.grid[0].hasOne) {
            const bak = this.grid[0].transform();
            if (arguments.length > 0) {
                this.grid.forEach((g) => g.transform(scale, rotate));
                this.fire('transform', {
                    scale,
                    rotate
                }, bak);
            }
            return bak;
        }
        return {
            scale: [1, 1],
            rotate: 0
        };
    }
    persist() {
        return {
            id: this.actDesc ? this.actDesc.id : null,
            contents: this.grid.map((elem) => elem.persist())
        };
    }
    restore(persisted) {
        const that = this;
        if (persisted.id) {
            const selected = this.visses.find((e) => e.id === persisted.id);
            if (selected) {
                return this.switchTo(selected).then((vis) => {
                    //FIXME
                    if (vis && persisted.content && typeof (vis.restore) === 'function') {
                        return Promise.resolve(vis.restore(persisted.content)).then(() => that);
                    }
                    return Promise.resolve(that);
                });
            }
        }
        return Promise.resolve(that);
    }
    locateGroup(range) {
        if (range.isAll || range.isNone) {
            const s = this.size;
            return Promise.resolve(Rect.rect(0, 0, s[0], s[1]));
        }
        const parentLoc = BaseUtils.offset(this.content);
        function relativePos(pos) {
            return {
                x: pos.x - parentLoc.left,
                y: pos.y - parentLoc.top
            };
        }
        const filterTo = () => {
            const inElems = [];
            for (const g of this.grid) {
                const matched = g.subrange(range);
                if (!matched.isNone) { //direct group hit
                    inElems.push({
                        g,
                        pos: relativePos(g.location),
                        r: matched
                    });
                }
            }
            return inElems;
        };
        const inElems = filterTo();
        if (inElems.length === 1) {
            return inElems[0].g.actVis.locate(inElems[0].r).then((loc) => {
                return loc ? loc.shift(inElems[0].pos) : loc;
            });
        }
        return Promise.all(inElems.map((elem) => elem.g.actVis.locate(elem.r))).then((locations) => {
            //shift the locations according to grid position
            locations = locations.map((loc, i) => loc ? loc.shift(inElems[i].pos) : loc).filter((loc) => loc != null);
            //merge into a single one
            const base = locations[0].aabb();
            let x = base.x, y = base.y, x2 = base.x2, y2 = base.y2;
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
    locateGroupById(range) {
        return this.data.ids().then((ids) => {
            return this.locateGroup(ids.indexOf(range));
        });
    }
    locate(...range) {
        const p = this.actVisPromise || Promise.resolve(null);
        return p.then((visses) => {
            if (!visses) {
                return Promise.resolve((range.length === 1 ? undefined : new Array(range.length)));
            }
            if (visses.length === 1) {
                return visses[0].locate.apply(visses[0], range);
            }
            else {
                //multiple groups
                if (range.length === 1) {
                    return this.locateGroup(range[0]);
                }
                else {
                    return Promise.all(range.map((arg) => this.locateGroup(arg)));
                }
            }
        });
    }
    locateById(...range) {
        const p = this.actVisPromise || Promise.resolve(null);
        return p.then((visses) => {
            if (!visses) {
                return Promise.resolve((range.length === 1 ? undefined : new Array(range.length)));
            }
            if (visses.length === 1) {
                return visses[0].locateById.apply(visses[0], range);
            }
            else {
                //multiple groups
                if (range.length === 1) {
                    return this.locateGroupById(range[0]);
                }
                else {
                    return Promise.all(range.map((arg) => this.locateGroupById(arg)));
                }
            }
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
    gridSize(raw = false) {
        const sizes = this.grid.map(raw ? (elem) => elem.rawSize : (elem) => elem.size);
        if (this.dims.length === 1) {
            //vertically groups only
            return {
                cols: [max(sizes, (s) => s[0])],
                rows: sizes.map((s) => s[1]),
                grid: sizes.map((s) => [s])
            };
        }
        else { //if (this.dims.length === 2)
            const cols = this.dims[1].length;
            const grid = this.dims[0].map((row, i) => sizes.slice(i * cols, (i + 1) * cols));
            return {
                cols: this.dims[1].map((d, i) => max(grid, (row) => row[i][0])),
                rows: grid.map((row) => max(row, (s) => s[1])),
                grid
            };
        }
    }
    get size() {
        const gridSize = this.gridSize();
        return [sum(gridSize.cols), sum(gridSize.rows)];
    }
    get rawSize() {
        const gridSize = this.gridSize(true);
        return [sum(gridSize.cols), sum(gridSize.rows)];
    }
    /**
     * switch to the desired vis technique given by index
     * @param param
     */
    switchTo(param) {
        const vis = FormUtils.selectVis(param, this.visses);
        if (vis === this.actDesc) {
            return this.actVisPromise; //already selected
        }
        //gracefully destroy
        this.grid.forEach((elem) => elem.switchDestroy());
        //switch and trigger event
        const bak = this.actDesc;
        this.actDesc = vis;
        this.markReady(false);
        this.fire('change', vis, bak);
        this.actVisPromise = null;
        if (vis) {
            //load the plugin and create the instance
            return this.actVisPromise = vis.load().then((plugin) => {
                if (this.actDesc !== vis) { //changed in the meanwhile
                    return null;
                }
                const options = BaseUtils.mixin({}, this.options.all, this.options[vis.id] || {});
                const r = this.grid.map((elem) => elem.build(plugin, options));
                let c = r.length;
                r.forEach((ri) => {
                    ri.on('ready', () => {
                        c--;
                        if (c === 0) { //all built
                            this.markReady();
                        }
                    });
                });
                this.fire('changed', vis, bak);
                return r;
            });
        }
        else {
            return Promise.resolve([]);
        }
    }
    addIconVisChooser(toolbar) {
        return VisChooser.addIconVisChooser(toolbar, this);
    }
    addSelectVisChooser(toolbar) {
        return VisChooser.addSelectVisChooser(toolbar);
    }
    static create(data, range, parent, viewFactory, options) {
        return new MultiFormGrid(data, range, parent, viewFactory, options);
    }
}
//# sourceMappingURL=MultiFormGrid.js.map