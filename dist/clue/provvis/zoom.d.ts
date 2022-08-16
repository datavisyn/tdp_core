import { IVisInstance } from './visInstance';
import { IVisMetaData } from './IVisMetaData';
import { EventHandler } from '../../base/event';
/**
 * utility logic for zooming a vis instance
 */
export declare class ZoomLogic extends EventHandler {
    readonly v: IVisInstance;
    readonly meta: IVisMetaData;
    constructor(v: IVisInstance, meta: IVisMetaData);
    zoomIn(): import("./ITransform").ITransform;
    zoomOut(): import("./ITransform").ITransform;
    /**
     * zooms in/out, -1 = zoom out, +1 zoom in, 0 no zoom operation
     * @param zoomX
     * @param zoomY
     * @returns {any}
     */
    zoom(zoomX: number, zoomY: number): import("./ITransform").ITransform;
    get isWidthFixed(): boolean;
    get isHeightFixed(): boolean;
    get isFixedAspectRatio(): boolean;
    /**
     * set specific zoom factors
     * @param zoomX
     * @param zoomY
     * @returns {any}
     */
    zoomSet(zoomX: number, zoomY: number): import("./ITransform").ITransform;
    /**
     * zooms to a given width and height based on the rawSize of the visualization
     * @param w
     * @param h
     * @returns {any}
     */
    zoomTo(w: number, h: number): import("./ITransform").ITransform;
}
/**
 * addition to ZoomLogic taking care of mouse wheel operations on the vis instance
 */
export declare class ZoomBehavior extends ZoomLogic {
    constructor(node: Element, v: IVisInstance, meta: IVisMetaData);
}
//# sourceMappingURL=zoom.d.ts.map