import { axisLeft, axisBottom, axisRight, scaleLinear, select, quadtree, Quadtree } from 'd3v7';
import { ISymbol, ISymbolRenderer, ERenderMode, SymbolUtils } from './symbol';
import { QuadtreeUtils, IBoundsPredicate } from './quadtree';
import { TDP_SCATTERPLOT_CSS_PREFIX, TDP_SCATTERPLOT_DEBUG, TDP_SCATTERPLOT_DEBUGLOG } from './constants';
import {
  AScatterplot,
  fixScale,
  IScale,
  IFormatOptions,
  IScatterplotOptions,
  IScalesObject,
  IAccessor,
  EScaleAxes,
  ERenderReason,
  INormalizedScalesObject,
} from './AScatterplot';

export interface IDualAxisScalesObject extends IScalesObject {
  y2: IScale;
}

export interface IDualAxisNormalizedScalesObject extends INormalizedScalesObject {
  n2pY2: IScale;
}

export interface IDualAxisFormatOptions extends IFormatOptions {
  /**
   * d3 format used for formatting the y2 axis
   */
  y2: string | ((n: number) => string) | null;
}

/**
 * scatterplot options
 */
export interface IDualAxisScatterplotOptions<T, U> extends IScatterplotOptions<T> {
  /**
   * x2 accessor of the secondary data
   * default: d.x
   * @param d
   */
  x2: IAccessor<U>;

  /**
   * y2 accessor of the secondary data
   * default: d.y
   * @param d
   */
  y2: IAccessor<U>;

  /**
   * y axis label
   * default: x
   */
  y2label: string;

  /**
   * d3 y2 scale
   * default: linear scale with a domain from 0...100
   */
  y2scale: IScale;

  /**
   * instead of specifying the scale just the y limits
   */
  y2lim: [number, number];

  /**
   * renderer used to render secondary dataset
   * default: steelblue circle
   */
  symbol2: ISymbol<U> | string;

  format: IDualAxisFormatOptions;
}

// normalized range the quadtree is defined
const DEFAULT_NORMALIZED_RANGE = [0, 100];

function defaultProps<T, U>(): Partial<IDualAxisScatterplotOptions<T, U>> {
  return {
    x2: (d) => (<any>d).x,
    y2: (d) => (<any>d).y,
    y2label: 'y2',
    y2scale: <IScale>scaleLinear().domain([0, 1000]),
    symbol2: 'o',
  };
}

/**
 * a class for rendering a double y-axis scatterplot in a canvas
 */
export class DualAxisScatterplot<T, U> extends AScatterplot<T, IDualAxisScatterplotOptions<T, U>> {
  protected readonly normalized2pixel: IDualAxisScalesObject = {
    x: scaleLinear(),
    y: scaleLinear(),
    y2: scaleLinear(),
  };

  private secondaryTree: Quadtree<U> | null = null;

  private readonly renderer: ISymbol<T>;

  private readonly secondaryRenderer: ISymbol<U>;

  constructor(data: T[], secondaryData: U[], root: HTMLElement, props: Partial<IDualAxisScatterplotOptions<T, U>> = {}) {
    super(root, <any>Object.assign(defaultProps<T, U>(), props));
    this.props.xscale = fixScale(this.props.xscale, this.props.x, data, props ? props.xscale : null, props ? props.xlim : null);
    this.props.yscale = fixScale(this.props.yscale, this.props.y, data, props ? props.yscale : null, props ? props.ylim : null);
    this.props.y2scale = fixScale(this.props.y2scale, this.props.y2, secondaryData, props ? props.y2scale : null, props ? props.y2lim : null);

    this.renderer = SymbolUtils.createRenderer(this.props.symbol);
    this.secondaryRenderer = SymbolUtils.createRenderer(this.props.symbol2);

    // generate aspect ratio right normalized domain
    this.normalized2pixel.x.domain(DEFAULT_NORMALIZED_RANGE.map((d) => d * this.props.aspectRatio));
    this.normalized2pixel.y.domain(DEFAULT_NORMALIZED_RANGE);
    this.normalized2pixel.y2.domain(DEFAULT_NORMALIZED_RANGE);

    this.setDataImpl(data);
    this.setSecondaryData(secondaryData);

    this.selectionTree = quadtree([], this.tree!.x(), this.tree!.y());

    this.initDOM(`
      <svg class="${TDP_SCATTERPLOT_CSS_PREFIX}-axis-right" style="width: ${this.props.marginLeft + 2}px; right: 0">
        <g transform="translate(0,${this.props.marginTop})"><g>
      </svg>
      <div class="${TDP_SCATTERPLOT_CSS_PREFIX}-axis-right-label"  style="top: ${this.props.marginTop + 2}px; bottom: ${
      this.props.marginBottom
    }px; right: 0"><div>${this.props.y2label}</div></div>
    `);

    this.canvasDataLayer = <HTMLCanvasElement>this.parent.children[0];
    this.canvasSelectionLayer = <HTMLCanvasElement>this.parent.children[1];
  }

  private setSecondaryData(secondaryData: U[]) {
    const domain2normalizedX = this.props.xscale.copy().range(this.normalized2pixel.x.domain());
    const domain2normalizedY2 = this.props.y2scale.copy().range(this.normalized2pixel.y2.domain());
    this.secondaryTree = quadtree(
      secondaryData,
      (d) => domain2normalizedX(this.props.x2(d))!,
      (d) => domain2normalizedY2(this.props.y2(d))!,
    );
  }

  set secondaryData(secondaryData: U[]) {
    this.setSecondaryData(secondaryData);
    this.render(ERenderReason.DIRTY);
  }

  transformedScales(): IDualAxisScalesObject {
    const xscale = this.rescale(EScaleAxes.x, this.props.xscale);
    const yscale = this.rescale(EScaleAxes.y, this.props.yscale);
    const y2scale = this.rescale(EScaleAxes.y, this.props.y2scale);
    return { x: xscale, y: yscale, y2: y2scale };
  }

  protected transformedNormalized2PixelScales(): IDualAxisNormalizedScalesObject {
    const n2pX = this.rescale(EScaleAxes.x, this.normalized2pixel.x);
    const n2pY = this.rescale(EScaleAxes.y, this.normalized2pixel.y);
    const n2pY2 = this.rescale(EScaleAxes.y, this.normalized2pixel.y2);
    return { n2pX, n2pY, n2pY2 };
  }

  // eslint-disable-next-line consistent-return
  render(reason = ERenderReason.DIRTY, transformDelta = { x: 0, y: 0, kx: 1, ky: 1 }): void {
    if (this.checkResize()) {
      // check resize
      return this.resized();
    }

    const c = this.canvasDataLayer!;
    const { marginLeft, marginBottom, marginRight, marginTop } = this.props;
    const bounds = { x0: marginLeft, y0: marginTop, x1: c.clientWidth - marginRight, y1: c.clientHeight - marginBottom };
    const boundsWidth = bounds.x1 - bounds.x0;
    const boundsHeight = bounds.y1 - bounds.y0;

    // emit render reason as string
    this.emit(DualAxisScatterplot.EVENT_RENDER, ERenderReason[reason], transformDelta);

    if (reason === ERenderReason.DIRTY) {
      this.props.xscale.range([0, boundsWidth]);
      this.props.yscale.range([boundsHeight, 0]);
      this.props.y2scale.range([boundsHeight, 0]);
      this.normalized2pixel.x.range(this.props.xscale.range());
      this.normalized2pixel.y.range(this.props.yscale.range());
      this.normalized2pixel.y2.range(this.props.y2scale.range());
    }

    // transform scale
    const { x: xscale, y: yscale, y2: y2scale } = this.transformedScales();

    const { n2pX, n2pY, n2pY2 } = this.transformedNormalized2PixelScales();

    const nx = (v: number) => n2pX.invert(v);
    const ny = (v: number) => n2pY.invert(v);
    const ny2 = (v: number) => n2pY2.invert(v);
    // inverted y scale
    const isNodeVisible = QuadtreeUtils.hasOverlap(nx(0), ny(boundsHeight), nx(boundsWidth), ny(0));
    const isNodeVisible2 = QuadtreeUtils.hasOverlap(nx(0), ny2(boundsHeight), nx(boundsWidth), ny2(0));

    const renderInfo = {
      zoomLevel: this.currentTransform.k,
    };

    const border = this.props.canvasBorder;

    const renderCtx = (isSelection = false, isSecondary = false) => {
      const ctx = (isSelection ? this.canvasSelectionLayer : this.canvasDataLayer)!.getContext('2d')!;
      if (!isSecondary) {
        ctx.clearRect(0, 0, c.width, c.height);
      }
      ctx.save();
      ctx.rect(bounds.x0 - border, bounds.y0 - border, boundsWidth + border * 2, boundsHeight + border * 2);
      ctx.clip();
      const tree = isSelection ? this.selectionTree : isSecondary ? this.secondaryTree : this.tree;
      const renderer = isSecondary
        ? this.secondaryRenderer(ctx, ERenderMode.NORMAL, renderInfo)
        : this.renderer(ctx, isSelection ? ERenderMode.SELECTED : ERenderMode.NORMAL, renderInfo);
      const debug = !isSelection && TDP_SCATTERPLOT_DEBUG;
      ctx.translate(bounds.x0, bounds.y0);

      if (!isSelection && this.props.renderBackground) {
        ctx.save();
        this.props.renderBackground(ctx, xscale, yscale);
        ctx.restore();
      }

      this.renderTree<T | U>(
        ctx,
        <any>tree,
        renderer,
        xscale,
        isSecondary ? y2scale : yscale,
        isSecondary ? isNodeVisible2 : isNodeVisible,
        isSecondary,
        debug,
      );

      if (isSelection && this.props.extras) {
        ctx.save();
        this.props.extras(ctx, xscale, yscale);
        ctx.restore();
      }

      ctx.restore();
      return ctx;
    };

    const renderSelection =
      typeof this.props.isSelectEvent !== 'function' && this.props.extras == null
        ? () => undefined
        : () => {
            const ctx = renderCtx(true);
            this.lasso.render(ctx);
          };

    const renderAxes = this.renderAxes.bind(this, xscale, yscale, y2scale);
    const renderData = renderCtx.bind(this, false);
    const renderSecondaryData = renderCtx.bind(this, false, true);

    const clearAutoZoomRedraw = () => {
      if (this.zoomHandle >= 0) {
        // delete auto redraw timer
        clearTimeout(this.zoomHandle);
        this.zoomHandle = -1;
      }
    };

    TDP_SCATTERPLOT_DEBUGLOG(ERenderReason[reason]);
    // render logic
    switch (reason) {
      case ERenderReason.PERFORM_TRANSLATE:
        clearAutoZoomRedraw();
        this.transformData(c, bounds, boundsWidth, boundsHeight, transformDelta.x, transformDelta.y, transformDelta.kx, transformDelta.ky);
        renderSelection();
        renderAxes();
        // redraw everything after a while, i.e stopped moving
        this.zoomHandle = window.setTimeout(this.render.bind(this, ERenderReason.AFTER_TRANSLATE), this.props.zoomDelay);
        break;
      case ERenderReason.SELECTION_CHANGED:
        renderSelection();
        break;
      case ERenderReason.AFTER_TRANSLATE:
        // just data needed after translation
        clearAutoZoomRedraw();
        renderData();
        renderSecondaryData();
        break;
      case ERenderReason.AFTER_SCALE_AND_TRANSLATE:
      case ERenderReason.AFTER_SCALE:
        // nothing current approach is to draw all
        break;
      // case ERenderReason.PERFORM_SCALE:
      // case ERenderReason.PERFORM_SCALE_AND_TRANSLATE:
      default:
        clearAutoZoomRedraw();
        renderData();
        renderSecondaryData();
        renderAxes();
        renderSelection();
    }
  }

  protected renderAxes(xscale: IScale, yscale: IScale, y2scale: IScale) {
    const left = axisLeft(yscale);
    const bottom = axisBottom(xscale);
    const right = axisRight(y2scale);
    const $parent = select(this.parent);
    this.setAxisFormat(left, 'y');
    this.setAxisFormat(bottom, 'x');
    this.setAxisFormat(right, <any>'y2');
    $parent.select<SVGGElement>(`.${TDP_SCATTERPLOT_CSS_PREFIX}-axis-left > g`).call(left);
    $parent.select<SVGGElement>(`.${TDP_SCATTERPLOT_CSS_PREFIX}-axis-bottom > g`).call(bottom);
    $parent.select<SVGGElement>(`.${TDP_SCATTERPLOT_CSS_PREFIX}-axis-right > g`).call(right);
  }

  private renderTree<X>(
    ctx: CanvasRenderingContext2D,
    tree: Quadtree<X>,
    renderer: ISymbolRenderer<X>,
    xscale: IScale,
    yscale: IScale,
    isNodeVisible: IBoundsPredicate,
    isSecondary = false,
    debug = false,
  ) {
    let x: IAccessor<X>;
    let y: IAccessor<X>;

    if (isSecondary) {
      // ({x2: x, y2: y} = this.props);
      const { x2, y2 } = this.props;
      x = <any>x2;
      y = <any>y2;
    } else {
      const { x: x2, y: y2 } = this.props;
      x = <any>x2;
      y = <any>y2;
    }

    // function debugNode(color:string, x0:number, y0:number, x1:number, y1:number) {
    //  ctx.closePath();
    //  ctx.fillStyle = 'steelblue';
    //  ctx.fill();
    //  ctx.fillStyle = color;
    //  x0 = xscale(x0);
    //  y0 = yscale(y0);
    //  x1 = xscale(x1);
    //  y1 = yscale(y1);
    //  ctx.fillRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x0 - x1), Math.abs(y0 - y1));
    //  ctx.beginPath();
    //
    // }
    // debug stats

    super.traverseTree(ctx, tree, renderer, xscale, yscale, isNodeVisible, debug, x, y);
  }

  static dualAxis<T, U>(data: T[], secondaryData: U[], canvas: HTMLCanvasElement, options: IDualAxisScatterplotOptions<T, U>) {
    return new DualAxisScatterplot(data, secondaryData, canvas, options);
  }
}
