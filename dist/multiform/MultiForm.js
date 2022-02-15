import { BaseUtils } from '../base/BaseUtils';
import { DataUtils } from '../data';
import { AVisInstance, VisUtils } from '../provvis';
import { VisChooser } from './VisChooser';
import { FormUtils, ProxyMetaData } from './internal/internal';
/**
 * a simple multi form class using a select to switch
 */
export class MultiForm extends AVisInstance {
    constructor(data, parent, options = {}) {
        super();
        this.data = data;
        this.options = options;
        this._metaData = new ProxyMetaData(() => this.actDesc);
        this.options = BaseUtils.mixin({
            initialVis: 0,
            all: {
            // options to all visses
            },
            filter: () => true,
        }, options);
        this.node = FormUtils.createNode(parent, 'div', 'multiform');
        DataUtils.assignData(parent, data);
        VisUtils.assignVis(this.node, this);
        // find all suitable plugins
        this.visses = VisUtils.listVisPlugins(data).filter(this.options.filter);
        this.build();
    }
    /**
     * converts this multiform to a vis metadata
     * @return {IVisMetaData}
     */
    get asMetaData() {
        return this._metaData;
    }
    build() {
        // create select option field
        // create content
        this.content = FormUtils.createNode(this.node, 'div', 'content');
        // switch to first
        this.switchTo(this.options.initialVis);
    }
    destroy() {
        if (this.actVis && typeof this.actVis.destroy === 'function') {
            this.actVis.destroy();
        }
        super.destroy();
    }
    persist() {
        return {
            id: this.actDesc ? this.actDesc.id : null,
            content: this.actVis && typeof this.actVis.persist === 'function' ? this.actVis.persist() : null,
        };
    }
    async restore(persisted) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        if (persisted.id) {
            const selected = this.visses.find((e) => e.id === persisted.id);
            if (selected) {
                const vis = await this.switchTo(selected);
                if (vis && persisted.content && typeof vis.restore === 'function') {
                    await Promise.resolve(vis.restore(persisted.content));
                }
                return that;
            }
        }
        return Promise.resolve(that);
    }
    locate(...range) {
        const p = this.actVisPromise || Promise.resolve(null);
        return p.then((...aa) => {
            const vis = aa.length > 0 ? aa[0] : undefined;
            if (vis && typeof vis.locate === 'function') {
                return vis.locate.apply(vis, range);
            }
            return Promise.resolve(aa.length === 1 ? undefined : new Array(range.length));
        });
    }
    locateById(...range) {
        const p = this.actVisPromise || Promise.resolve(null);
        return p.then((...aa) => {
            const vis = aa.length > 0 ? aa[0] : undefined;
            if (vis && typeof vis.locateById === 'function') {
                return vis.locateById.apply(vis, range);
            }
            return Promise.resolve(aa.length === 1 ? undefined : new Array(range.length));
        });
    }
    transform(scale, rotate) {
        if (this.actVis) {
            if (arguments.length === 0) {
                return this.actVis.transform();
            }
            const t = (event, newValue, old) => {
                this.fire('transform', newValue, old);
            };
            this.actVis.on('transform', t);
            const r = this.actVis.transform(scale, rotate);
            this.actVis.off('transform', t);
            return r;
        }
        if (this.actVisPromise && arguments.length > 0) {
            // 2nd try
            this.actVisPromise.then((v) => this.transform(scale, rotate));
        }
        return {
            scale: [1, 1],
            rotate: 0,
        };
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
    get size() {
        if (this.actVis) {
            return this.actVis.size;
        }
        return [100, 100];
    }
    get rawSize() {
        if (this.actVis) {
            return this.actVis.rawSize;
        }
        return [100, 100];
    }
    /**
     * switch to the desired vis technique given by index
     * @param param
     */
    switchTo(param) {
        const vis = FormUtils.selectVis(param, this.visses);
        if (vis === this.actDesc) {
            return this.actVisPromise; // already selected
        }
        // gracefully destroy
        if (this.actVis) {
            this.actVis.destroy();
            this.actVis = null;
            this.actVisPromise = null;
        }
        // remove content dom side
        FormUtils.clearNode(this.content);
        // switch and trigger event
        const bak = this.actDesc;
        this.actDesc = vis;
        this.markReady(false);
        this.fire('change', vis, bak);
        this.actVis = null;
        this.actVisPromise = null;
        if (vis) {
            // load the plugin and create the instance
            return (this.actVisPromise = vis.load().then((plugin) => {
                if (this.actDesc !== vis) {
                    // changed in the meanwhile
                    return null;
                }
                this.actVis = plugin.factory(this.data, this.content, BaseUtils.mixin({}, this.options.all, this.options[vis.id] || {}));
                if (this.actVis.isBuilt) {
                    this.markReady();
                }
                else {
                    this.actVis.on('ready', () => {
                        this.markReady();
                    });
                }
                this.fire('changed', vis, bak);
                return this.actVis;
            }));
        }
        return Promise.resolve(null);
    }
    addIconVisChooser(toolbar) {
        return VisChooser.addIconVisChooser(toolbar, this);
    }
    addSelectVisChooser(toolbar) {
        return VisChooser.addSelectVisChooser(toolbar);
    }
    static create(data, parent, options) {
        return new MultiForm(data, parent, options);
    }
}
//# sourceMappingURL=MultiForm.js.map