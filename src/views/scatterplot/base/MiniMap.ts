/**
 * Created by sam on 19.12.2016.
 */

import { select, event as d3event } from 'd3-selection';
import { ScaleLinear, scaleLinear } from 'd3-scale';
import { brushX, brushY, brush, D3BrushEvent, BrushBehavior } from 'd3-brush';
import { Scatterplot } from './Scatterplot';
import { TDP_SCATTERPLOT_CSS_PREFIX } from './constants';
import { EScaleAxes, IMinMax, IWindow } from './AScatterplot';

export interface IMiniMapOptions {
  scale: EScaleAxes;
}

export class MiniMap {
  private readonly brush: BrushBehavior<any>;

  private readonly props: Readonly<IMiniMapOptions> = {
    scale: EScaleAxes.xy,
  };

  private readonly xscale = scaleLinear();

  private readonly yscale = scaleLinear();

  private readonly node: SVGGElement;

  constructor(plot: Scatterplot<any>, private parent: HTMLElement, props: Partial<IMiniMapOptions> = {}) {
    this.props = Object.assign(this.props, props);
    parent.innerHTML = `<svg class="${TDP_SCATTERPLOT_CSS_PREFIX}-minimap"><g></g></svg>`;
    parent.classList.add(TDP_SCATTERPLOT_CSS_PREFIX);

    switch (this.props.scale) {
      case EScaleAxes.x:
        this.brush = brushX();
        break;
      case EScaleAxes.y:
        this.brush = brushY();
        break;
      default:
        this.brush = brush();
        break;
    }
    const d = plot.domain;
    this.xscale.domain(d.xMinMax);
    this.yscale.domain(d.yMinMax);
    const $node = select(parent).select<SVGGElement>('svg > g').call(this.brush);
    this.node = <SVGGElement>$node.node();

    this.update(plot.window);
    $node.call(this.brush.on('brush', this.brushed.bind(this)));
    plot.on(Scatterplot.EVENT_WINDOW_CHANGED, this.update.bind(this));
  }

  private brushed() {
    const s = (<D3BrushEvent<any>>d3event).selection;
    let xMinMax = <IMinMax>this.xscale.domain();
    let yMinMax = <IMinMax>this.yscale.domain();

    let sx: IMinMax;
    let sy: IMinMax;
    switch (this.props.scale) {
      case EScaleAxes.x:
        sx = <IMinMax>s;
        xMinMax = this.scale(sx, this.xscale.invert.bind(this.xscale));
        break;
      case EScaleAxes.y:
        sy = <IMinMax>s;
        yMinMax = this.scale(sy, this.yscale.invert.bind(this.yscale));
        break;
      default:
        [sx, sy] = <[IMinMax, IMinMax]>s;
        xMinMax = this.scale(sx, this.xscale.invert.bind(this.xscale));
        yMinMax = this.scale(sy, this.yscale.invert.bind(this.yscale));
        break;
    }
    return { xMinMax, yMinMax };
  }

  private update(window: IWindow) {
    this.xscale.range([0, this.parent.clientWidth]);
    this.yscale.range([0, this.parent.clientHeight]);
    this.node.parentElement!.setAttribute('width', this.parent.clientWidth.toString());
    this.node.parentElement!.setAttribute('height', this.parent.clientHeight.toString());
    this.brush.extent([<IMinMax>this.xscale.range(), <IMinMax>this.yscale.range()]);

    const $node = select<SVGGElement, any>(this.node);
    switch (this.props.scale) {
      case EScaleAxes.x:
        this.brush.move($node, this.scale(window.xMinMax, this.xscale));
        break;
      case EScaleAxes.y:
        this.brush.move($node, this.scale(window.yMinMax, this.yscale));
        break;
      default:
        // eslint-disable-next-line no-case-declarations
        const s: [IMinMax, IMinMax] = [this.scale(window.xMinMax, this.xscale), this.scale(window.yMinMax, this.yscale)];
        this.brush.move($node, s);
        break;
    }
  }

  /**
   * Utility method to scale two elements of a tuple type instead of calling the map function on a Tuple type
   * @param {IMinMax} minMax
   * @param {ScaleLinear<number, number>} scale
   * @returns {[number , number]}
   */
  private scale(minMax: IMinMax, scale: ScaleLinear<number, number>): [number, number] {
    return [scale(minMax[0]), scale(minMax[1])];
  }
}
