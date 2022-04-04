import { AxisScale, Axis } from 'd3-axis';
import { ZoomScale, ZoomTransform, ZoomBehavior } from 'd3-zoom';
import { Quadtree } from 'd3-quadtree';
import { EventEmitter } from 'eventemitter3';
import { ISymbol, ISymbolRenderer } from './symbol';
import { IBoundsPredicate, ITester } from './quadtree';
import { Lasso, ILassoOptions } from './lasso';
export declare enum EScaleAxes {
    x = 0,
    y = 1,
    xy = 2
}
export interface IBoundsObject {
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}
/**
 * a d3 scale essentially
 */
export interface IScale extends AxisScale<number>, ZoomScale {
    range(range: number[]): this;
    range(): number[];
    domain(): number[];
    domain(domain: number[]): this;
    invert(v: number): number;
    copy(): this;
    (x: number): number | undefined;
    bandwidth?(): number;
}
export interface IScalesObject {
    x: IScale;
    y: IScale;
}
export interface INormalizedScalesObject {
    n2pX: IScale;
    n2pY: IScale;
}
export interface IAccessor<T> {
    (v: T): number;
}
export interface IZoomOptions {
    /**
     * scaling option whether to scale both, one, or no axis
     */
    scale: EScaleAxes;
    /**
     * delay before a full redraw is shown during zooming
     */
    zoomDelay: number;
    /**
     * min max scaling factor
     * default: 0.1, 10
     */
    zoomScaleExtent: [number, number];
    /**
     * initial zoom window
     */
    zoomWindow: IWindow | null;
    /**
     * initial scale factor
     */
    zoomScaleTo: number;
    /**
     * initial translate
     */
    zoomTranslateBy: [number, number];
}
export interface IFormatOptions {
    [key: string]: string | ((n: number) => string) | null;
}
export interface ITickOptions {
    [key: string]: number[] | ((s: IScale) => number[]) | null;
}
/**
 * margin for the scatterplot area
 * default (left=40, top=10, right=10, bottom=20)
 */
export interface IMarginOptions {
    marginLeft: number;
    marginTop: number;
    marginRight: number;
    marginBottom: number;
    canvasBorder: number;
}
/**
 * scatterplot options
 */
export interface IScatterplotOptions<T> extends IMarginOptions, IZoomOptions {
    format: IFormatOptions;
    ticks: ITickOptions;
    /**
     * x accessor of the data
     * default: d.x
     * @param d
     */
    x: IAccessor<T>;
    /**
     * x axis label
     * default: x
     */
    xlabel: string;
    /**
     * y axis label
     * default: x
     */
    ylabel: string;
    /**
     * y accessor of the data
     * default: d.y
     * @param d
     */
    y: IAccessor<T>;
    /**
     * d3 x scale
     * default: linear scale with a domain from 0...100
     */
    xscale: IScale;
    /**
     * instead of specifying the scale just the x limits
     */
    xlim: [number, number] | null;
    /**
     * d3 y scale
     * default: linear scale with a domain from 0...100
     */
    yscale: IScale;
    /**
     * instead of specifying the scale just the y limits
     */
    ylim: [number, number] | null;
    /**
     * symbol used to render an data point
     * default: steelblue circle
     */
    symbol: ISymbol<T> | string;
    /**
     * the radius in pixel in which a mouse click will be searched
     * default: 10
     */
    clickRadius: number;
    /**
     * delay before a tooltip will be shown after a mouse was moved
     * default: 500
     */
    tooltipDelay: number;
    /**
     * shows the tooltip
     * default: simple popup similar to bootstrap
     * if `null` or `false` tooltips are disabled
     * @param parent the scatterplot html element
     * @param items items to show, empty to hide tooltip
     * @param x the x position relative to the plot
     * @param y the y position relative to the plot
     * @param event the MouseEvent
     */
    showTooltip(parent: HTMLElement, items: T[], x: number, y: number, event?: MouseEvent): void;
    /**
     * determines whether the given mouse is a selection or panning event, if `null` or `false` selection is disabled
     * default: event.ctrlKey || event.altKey
     *
     */
    isSelectEvent: ((event: MouseEvent) => boolean) | null | false;
    /**
     * lasso options
     */
    lasso: Partial<ILassoOptions & {
        /**
         * lasso update frequency to improve performance
         */
        interval: number;
    }>;
    /**
     * additional render elements, e.g. lines
     * @param ctx
     * @param xscale
     * @param yscale
     */
    extras: ((ctx: CanvasRenderingContext2D, xscale: IScale, yscale: IScale) => void) | null;
    /**
     * optional hint for the scatterplot in which aspect ratio it will be rendered. This is useful for improving the selection and interaction in non 1:1 aspect ratios
     */
    aspectRatio: number;
    /**
     * additional background rendering
     */
    renderBackground: ((ctx: CanvasRenderingContext2D, xscale: IScale, yscale: IScale) => void) | null;
}
/**
 * reasons why a new render pass is needed
 */
export declare enum ERenderReason {
    DIRTY = 0,
    SELECTION_CHANGED = 1,
    ZOOMED = 2,
    PERFORM_SCALE_AND_TRANSLATE = 3,
    AFTER_SCALE_AND_TRANSLATE = 4,
    PERFORM_TRANSLATE = 5,
    AFTER_TRANSLATE = 6,
    PERFORM_SCALE = 7,
    AFTER_SCALE = 8
}
export declare type IMinMax = [number, number];
/**
 * visible window
 */
export interface IWindow {
    xMinMax: IMinMax;
    yMinMax: IMinMax;
}
/**
 * @internal
 */
export declare function fixScale<T>(current: IScale, acc: IAccessor<T>, data: T[], given: IScale | null | undefined, givenLimits: [number, number] | null | undefined): IScale;
export interface ITransformDelta {
    x: number;
    y: number;
    kx: number;
    ky: number;
}
/**
 * an class for rendering a scatterplot in a canvas
 */
export declare abstract class AScatterplot<T, C extends IScatterplotOptions<T>> extends EventEmitter {
    static EVENT_SELECTION_CHANGED: string;
    static EVENT_SELECTION_IN_PROGRESS_CHANGED: string;
    static EVENT_RENDER: string;
    static EVENT_WINDOW_CHANGED: string;
    static EVENT_MOUSE_CLICKED: string;
    static EVENT_DRAGGED: string;
    static EVENT_MOUSE_MOVED: string;
    static EVENT_ZOOM_CHANGED: string;
    protected canvasDataLayer: HTMLCanvasElement | null;
    protected canvasSelectionLayer: HTMLCanvasElement | null;
    protected tree: Quadtree<T> | null;
    protected selectionTree: Quadtree<T> | null;
    /**
     * timout handle when the tooltip is shown
     * @type {number}
     */
    protected showTooltipHandle: number;
    protected readonly lasso: Lasso;
    protected currentTransform: ZoomTransform;
    protected readonly zoomBehavior: ZoomBehavior<HTMLElement, any> | null;
    protected zoomStartTransform: ZoomTransform;
    protected zoomHandle: number;
    protected dragHandle: number;
    protected readonly parent: HTMLElement;
    protected props: C;
    protected abstract normalized2pixel: IScalesObject;
    protected abstract transformedNormalized2PixelScales(): INormalizedScalesObject;
    abstract transformedScales(): IScalesObject;
    abstract render(reason?: ERenderReason, transformDelta?: ITransformDelta): void;
    constructor(root: HTMLElement, props?: Partial<C>);
    get node(): HTMLElement;
    protected initDOM(extraMarkup?: string): void;
    protected setDataImpl(data: T[]): void;
    set data(data: T[]);
    get data(): T[];
    /**
     * returns the total domain
     * @returns {{xMinMax: number[], yMinMax: number[]}}
     */
    get domain(): IWindow;
    protected hasTooltips(): boolean;
    protected resized(): void;
    protected getMouseNormalizedPos(canvasPixelPox?: number[]): {
        x: number;
        y: number;
        clickRadiusX: number;
        clickRadiusY: number;
    };
    /**
     * returns the current selection
     */
    get selection(): T[];
    /**
     * sets the current selection
     * @param selection
     */
    set selection(selection: T[]);
    setSelection(selection: T[]): boolean;
    private setSelectionImpl;
    /**
     * clears the selection, same as .selection=[]
     */
    clearSelection(): boolean;
    private clearSelectionImpl;
    /**
     * shortcut to add items to the selection
     * @param items
     */
    addToSelection(items: T[]): boolean;
    /**
     * shortcut to remove items from the selection
     * @param items
     */
    removeFromSelection(items: T[]): boolean;
    protected selectWithTester(tester: ITester, inProgress?: boolean): boolean;
    protected checkResize(): boolean;
    /**
     * adapt the current translation (is absolute in pixels) and consider if the dimensions of the canvas element have changed
     */
    private adaptMaxTranslation;
    protected rescale(axis: EScaleAxes, scale: IScale): IScale;
    protected mousePosAtCanvas(): number[];
    private setTransform;
    private window2transform;
    /**
     * returns the current visible window
     * @returns {{xMinMax: [number,number], yMinMax: [number,number]}}
     */
    get window(): IWindow;
    /**
     * sets the current visible window
     * @param window
     */
    set window(window: IWindow);
    private onZoomStart;
    private isZoomed;
    private shiftTransform;
    private onZoom;
    private onZoomEnd;
    private onDragStart;
    private onDrag;
    private updateDrag;
    private onDragEnd;
    private retestLasso;
    private onClick;
    private showTooltip;
    findItems(canvasPos: [number, number]): T[];
    private onMouseMove;
    private onMouseLeave;
    protected traverseTree<X>(ctx: CanvasRenderingContext2D, tree: Quadtree<X>, renderer: ISymbolRenderer<X>, xscale: IScale, yscale: IScale, isNodeVisible: IBoundsPredicate, debug: boolean, x: IAccessor<X>, y: IAccessor<X>): void;
    protected setAxisFormat(axis: Axis<number>, key: keyof IFormatOptions): void;
    protected transformData(c: HTMLCanvasElement, bounds: IBoundsObject, boundsWidth: number, boundsHeight: number, x: number, y: number, kx: number, ky: number): void;
    private useAggregation;
}
//# sourceMappingURL=AScatterplot.d.ts.map