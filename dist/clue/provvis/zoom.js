import { EventHandler } from '../../base/event';
/**
 * utility logic for zooming a vis instance
 */
export class ZoomLogic extends EventHandler {
    constructor(v, meta) {
        super();
        this.v = v;
        this.meta = meta;
    }
    zoomIn() {
        return this.zoom(1, 1);
    }
    zoomOut() {
        return this.zoom(-1, -1);
    }
    /**
     * zooms in/out, -1 = zoom out, +1 zoom in, 0 no zoom operation
     * @param zoomX
     * @param zoomY
     * @returns {any}
     */
    zoom(zoomX, zoomY) {
        if (!this.v) {
            return null;
        }
        function toDelta(x) {
            return x > 0 ? 0.2 : x < 0 ? -0.2 : 0;
        }
        const old = this.v.transform();
        const deltaX = toDelta(zoomX);
        const deltaY = toDelta(zoomY);
        return this.zoomSet(old.scale[0] + deltaX, old.scale[1] + deltaY);
    }
    get isWidthFixed() {
        return this.meta && this.meta.scaling === 'height-only';
    }
    get isHeightFixed() {
        return this.meta && this.meta.scaling === 'width-only';
    }
    get isFixedAspectRatio() {
        return this.meta && this.meta.scaling === 'aspect';
    }
    /**
     * set specific zoom factors
     * @param zoomX
     * @param zoomY
     * @returns {any}
     */
    zoomSet(zoomX, zoomY) {
        if (!this.v) {
            return null;
        }
        const old = this.v.transform();
        const s = [zoomX, zoomY];
        switch (this.meta ? this.meta.scaling : 'free') {
            case 'width-only':
                s[1] = old.scale[1];
                break;
            case 'height-only':
                s[0] = old.scale[0];
                break;
            default:
                break;
        }
        if (s[0] <= 0) {
            s[0] = 0.001;
        }
        if (s[1] <= 0) {
            s[1] = 0.001;
        }
        if (this.meta && this.meta.scaling === 'aspect') {
            // same aspect ratio use min scale
            s[0] = s[1] = Math.min(...s);
        }
        this.fire('zoom', {
            scale: s,
            rotate: old.rotate,
        }, old);
        return this.v.transform(s, old.rotate);
    }
    /**
     * zooms to a given width and height based on the rawSize of the visualization
     * @param w
     * @param h
     * @returns {any}
     */
    zoomTo(w, h) {
        if (!this.v) {
            return null;
        }
        const ori = this.v.rawSize;
        return this.zoomSet(w / ori[0], h / ori[1]);
    }
}
/**
 * addition to ZoomLogic taking care of mouse wheel operations on the vis instance
 */
export class ZoomBehavior extends ZoomLogic {
    constructor(node, v, meta) {
        super(v, meta);
        node.addEventListener('mousewheel', (event) => {
            if (!this.v) {
                return;
            }
            const { ctrlKey } = event; // both
            const { shiftKey } = event; // y
            const { altKey } = event; // x
            const m = event.wheelDelta;
            this.zoom(m * (ctrlKey || altKey ? 1 : 0), m * (ctrlKey || shiftKey ? 1 : 0));
            if (ctrlKey || shiftKey || altKey) {
                event.preventDefault();
            }
        });
    }
}
//# sourceMappingURL=zoom.js.map