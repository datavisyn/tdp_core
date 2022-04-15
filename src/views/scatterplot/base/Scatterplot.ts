import { axisLeft, axisBottom, scaleLinear, select, quadtree, Quadtree } from 'd3v7';
import { ISymbol, ISymbolRenderer, ERenderMode, SymbolUtils } from './symbol';
import { QuadtreeUtils, IBoundsPredicate } from './quadtree';
import { TDP_SCATTERPLOT_CSS_PREFIX, TDP_SCATTERPLOT_DEBUG, TDP_SCATTERPLOT_DEBUGLOG } from './constants';
import { AScatterplot, fixScale, IScale, IScatterplotOptions, IScalesObject, EScaleAxes, ERenderReason, INormalizedScalesObject } from './AScatterplot';

// normalized range the quadtree is defined
const DEFAULT_NORMALIZED_RANGE = [0, 100];

/**
 * a class for rendering a scatterplot in a canvas
 */
export class Scatterplot<T> extends AScatterplot<T, IScatterplotOptions<T>> {
  protected readonly normalized2pixel: IScalesObject = {
    x: scaleLinear(),
    y: scaleLinear(),
  };

  private readonly renderer: ISymbol<T>;

  constructor(data: T[], root: HTMLElement, props?: Partial<IScatterplotOptions<T>>) {
    super(root, <any>props);
    this.props.xscale = fixScale(this.props.xscale, this.props.x, data, props ? props.xscale : null, props ? props.xlim : null);
    this.props.yscale = fixScale(this.props.yscale, this.props.y, data, props ? props.yscale : null, props ? props.ylim : null);

    this.renderer = SymbolUtils.createRenderer(this.props.symbol);

    // generate aspect ratio right normalized domain
    this.normalized2pixel.x.domain(DEFAULT_NORMALIZED_RANGE.map((d) => d * this.props.aspectRatio));
    this.normalized2pixel.y.domain(DEFAULT_NORMALIZED_RANGE);

    this.setDataImpl(data);

    this.selectionTree = quadtree([], this.tree!.x(), this.tree!.y());

    this.initDOM();

    this.canvasDataLayer = <HTMLCanvasElement>this.parent.children[0];
    this.canvasSelectionLayer = <HTMLCanvasElement>this.parent.children[1];
  }

  transformedScales(): IScalesObject {
    const xscale = this.rescale(EScaleAxes.x, this.props.xscale);
    const yscale = this.rescale(EScaleAxes.y, this.props.yscale);
    return { x: xscale, y: yscale };
  }

  protected transformedNormalized2PixelScales(): INormalizedScalesObject {
    const n2pX = this.rescale(EScaleAxes.x, this.normalized2pixel.x);
    const n2pY = this.rescale(EScaleAxes.y, this.normalized2pixel.y);
    return { n2pX, n2pY };
  }

  // eslint-disable-next-line consistent-return
  render(reason = ERenderReason.DIRTY, transformDelta = { x: 0, y: 0, kx: 1, ky: 1 }): void {
    if (this.checkResize()) {
      // check resize
      return this.resized();
    }

    const c = this.canvasDataLayer!;
    const { marginLeft, marginTop, marginRight, marginBottom } = this.props;
    const bounds = { x0: marginLeft, y0: marginTop, x1: c.clientWidth - marginRight, y1: c.clientHeight - marginBottom };
    const boundsWidth = bounds.x1 - bounds.x0;
    const boundsHeight = bounds.y1 - bounds.y0;

    // emit render reason as string
    this.emit(Scatterplot.EVENT_RENDER, ERenderReason[reason], transformDelta);

    if (reason === ERenderReason.DIRTY) {
      this.props.xscale.range([0, boundsWidth]);
      this.props.yscale.range([boundsHeight, 0]);
      this.normalized2pixel.x.range(this.props.xscale.range());
      this.normalized2pixel.y.range(this.props.yscale.range());
    }

    // transform scale
    const { x: xscale, y: yscale } = this.transformedScales();

    const { n2pX, n2pY } = this.transformedNormalized2PixelScales();
    const nx = (v: number) => n2pX.invert(v);
    const ny = (v: number) => n2pY.invert(v);
    // inverted y scale
    const isNodeVisible = QuadtreeUtils.hasOverlap(nx(0), ny(boundsHeight), nx(boundsWidth), ny(0));

    const renderInfo = {
      zoomLevel: this.currentTransform.k,
    };

    const border = this.props.canvasBorder;

    const renderData = (isSelection = false) => {
      const ctx = (isSelection ? this.canvasSelectionLayer : this.canvasDataLayer)!.getContext('2d')!;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.save();
      ctx.rect(bounds.x0 - border, bounds.y0 - border, boundsWidth + border * 2, boundsHeight + border * 2);
      ctx.clip();

      const tree = isSelection ? this.selectionTree : this.tree;
      const renderer = this.renderer(ctx, isSelection ? ERenderMode.SELECTED : ERenderMode.NORMAL, renderInfo);
      const debug = !isSelection && TDP_SCATTERPLOT_DEBUG;
      ctx.translate(bounds.x0, bounds.y0);

      if (!isSelection && this.props.renderBackground != null) {
        ctx.save();
        this.props.renderBackground(ctx, xscale, yscale);
        ctx.restore();
      }

      this.renderTree(ctx, tree!, renderer, xscale, yscale, isNodeVisible, debug);

      if (isSelection && this.props.extras != null) {
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
            const ctx = renderData(true);
            this.lasso.render(ctx);
          };

    const renderAxes = this.renderAxes.bind(this, xscale, yscale);

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
        renderAxes();
        renderSelection();
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
        renderAxes();
        renderSelection();
    }
  }

  protected renderAxes(xscale: IScale, yscale: IScale) {
    const left = axisLeft(yscale);
    const bottom = axisBottom(xscale);
    const $parent = select(this.parent);
    this.setAxisFormat(left, 'y');
    this.setAxisFormat(bottom, 'x');
    $parent.select<SVGGElement>(`.${TDP_SCATTERPLOT_CSS_PREFIX}-axis-left > g`).call(left);
    $parent.select<SVGGElement>(`.${TDP_SCATTERPLOT_CSS_PREFIX}-axis-bottom > g`).call(bottom);
  }

  private renderTree(
    ctx: CanvasRenderingContext2D,
    tree: Quadtree<T>,
    renderer: ISymbolRenderer<T>,
    xscale: IScale,
    yscale: IScale,
    isNodeVisible: IBoundsPredicate,
    debug = false,
  ) {
    const { x, y } = this.props;

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

  static create<T>(data: T[], canvas: HTMLCanvasElement, options: IScatterplotOptions<T>): Scatterplot<T> {
    return new Scatterplot(data, canvas, options);
  }
}
