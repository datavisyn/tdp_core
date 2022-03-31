/**
 * Created by sam on 19.12.2016.
 */
import { select, event as d3event, scaleLinear, brushX, brushY, brush } from 'd3v4';
import { Scatterplot } from './Scatterplot';
import { TDP_SCATTERPLOT_CSS_PREFIX } from './constants';
import { EScaleAxes } from './AScatterplot';
export class MiniMap {
    constructor(plot, parent, props = {}) {
        this.parent = parent;
        this.props = {
            scale: EScaleAxes.xy,
        };
        this.xscale = scaleLinear();
        this.yscale = scaleLinear();
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
        const $node = select(parent).select('svg > g').call(this.brush);
        this.node = $node.node();
        this.update(plot.window);
        $node.call(this.brush.on('brush', this.brushed.bind(this)));
        plot.on(Scatterplot.EVENT_WINDOW_CHANGED, this.update.bind(this));
    }
    brushed() {
        const s = d3event.selection;
        let xMinMax = this.xscale.domain();
        let yMinMax = this.yscale.domain();
        let sx;
        let sy;
        switch (this.props.scale) {
            case EScaleAxes.x:
                sx = s;
                xMinMax = this.scale(sx, this.xscale.invert.bind(this.xscale));
                break;
            case EScaleAxes.y:
                sy = s;
                yMinMax = this.scale(sy, this.yscale.invert.bind(this.yscale));
                break;
            default:
                [sx, sy] = s;
                xMinMax = this.scale(sx, this.xscale.invert.bind(this.xscale));
                yMinMax = this.scale(sy, this.yscale.invert.bind(this.yscale));
                break;
        }
        return { xMinMax, yMinMax };
    }
    update(window) {
        this.xscale.range([0, this.parent.clientWidth]);
        this.yscale.range([0, this.parent.clientHeight]);
        this.node.parentElement.setAttribute('width', this.parent.clientWidth.toString());
        this.node.parentElement.setAttribute('height', this.parent.clientHeight.toString());
        this.brush.extent([this.xscale.range(), this.yscale.range()]);
        const $node = select(this.node);
        switch (this.props.scale) {
            case EScaleAxes.x:
                this.brush.move($node, this.scale(window.xMinMax, this.xscale));
                break;
            case EScaleAxes.y:
                this.brush.move($node, this.scale(window.yMinMax, this.yscale));
                break;
            default:
                // eslint-disable-next-line no-case-declarations
                const s = [this.scale(window.xMinMax, this.xscale), this.scale(window.yMinMax, this.yscale)];
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
    scale(minMax, scale) {
        return [scale(minMax[0]), scale(minMax[1])];
    }
}
//# sourceMappingURL=MiniMap.js.map