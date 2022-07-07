import { drag as d3drag, quadtree, scaleLinear, extent, format, select, zoom as d3zoom, zoomIdentity, pointer, } from 'd3v7';
import { EventEmitter } from 'eventemitter3';
import { ObjectUtils } from './ObjectUtils';
import { QuadtreeUtils } from './quadtree';
import { Lasso } from './lasso';
import { TDP_SCATTERPLOT_CSS_PREFIX, TDP_SCATTERPLOT_DEBUGLOG } from './constants';
import { ScatterplotTooltipUtils } from './tooltip';
export var EScaleAxes;
(function (EScaleAxes) {
    EScaleAxes[EScaleAxes["x"] = 0] = "x";
    EScaleAxes[EScaleAxes["y"] = 1] = "y";
    EScaleAxes[EScaleAxes["xy"] = 2] = "xy";
})(EScaleAxes || (EScaleAxes = {}));
/**
 * reasons why a new render pass is needed
 */
export var ERenderReason;
(function (ERenderReason) {
    ERenderReason[ERenderReason["DIRTY"] = 0] = "DIRTY";
    ERenderReason[ERenderReason["SELECTION_CHANGED"] = 1] = "SELECTION_CHANGED";
    ERenderReason[ERenderReason["ZOOMED"] = 2] = "ZOOMED";
    ERenderReason[ERenderReason["PERFORM_SCALE_AND_TRANSLATE"] = 3] = "PERFORM_SCALE_AND_TRANSLATE";
    ERenderReason[ERenderReason["AFTER_SCALE_AND_TRANSLATE"] = 4] = "AFTER_SCALE_AND_TRANSLATE";
    ERenderReason[ERenderReason["PERFORM_TRANSLATE"] = 5] = "PERFORM_TRANSLATE";
    ERenderReason[ERenderReason["AFTER_TRANSLATE"] = 6] = "AFTER_TRANSLATE";
    ERenderReason[ERenderReason["PERFORM_SCALE"] = 7] = "PERFORM_SCALE";
    ERenderReason[ERenderReason["AFTER_SCALE"] = 8] = "AFTER_SCALE";
})(ERenderReason || (ERenderReason = {}));
/**
 * @internal
 */
export function fixScale(current, acc, data, given, givenLimits) {
    if (given) {
        return given;
    }
    if (givenLimits) {
        return current.domain(givenLimits);
    }
    const ex = extent(data, acc);
    return current.domain([ex[0], ex[1]]);
}
function defaultProps() {
    return {
        marginLeft: 48,
        marginTop: 10,
        marginBottom: 32,
        marginRight: 10,
        canvasBorder: 0,
        clickRadius: 10,
        x: (d) => d.x,
        y: (d) => d.y,
        xlabel: 'x',
        ylabel: 'y',
        xscale: scaleLinear().domain([0, 100]),
        xlim: null,
        yscale: scaleLinear().domain([0, 100]),
        ylim: null,
        symbol: 'o',
        scale: EScaleAxes.xy,
        zoomDelay: 300,
        zoomScaleExtent: [1, +Infinity],
        zoomWindow: null,
        zoomScaleTo: 1,
        zoomTranslateBy: [0, 0],
        format: {},
        ticks: {},
        tooltipDelay: 500,
        showTooltip: ScatterplotTooltipUtils.showTooltip,
        isSelectEvent: (event) => event.ctrlKey || event.altKey,
        lasso: { interval: 100, ...Lasso.defaultOptions() },
        extras: null,
        renderBackground: null,
        aspectRatio: 1,
    };
}
/**
 * an class for rendering a scatterplot in a canvas
 */
export class AScatterplot extends EventEmitter {
    constructor(root, props) {
        super();
        this.canvasDataLayer = null;
        this.canvasSelectionLayer = null;
        this.tree = null;
        this.selectionTree = null;
        /**
         * timout handle when the tooltip is shown
         * @type {number}
         */
        this.showTooltipHandle = -1;
        this.lasso = new Lasso();
        this.currentTransform = zoomIdentity;
        this.zoomStartTransform = zoomIdentity;
        this.zoomHandle = -1;
        this.dragHandle = -1;
        this.props = ObjectUtils.merge(defaultProps(), props);
        this.parent = root.ownerDocument.createElement('div');
        // need to use d3 for d3.mouse to work
        const $parent = select(this.parent);
        root.appendChild(this.parent);
        if (this.props.scale !== null) {
            // register zoom
            this.zoomBehavior = d3zoom()
                .on('start', this.onZoomStart.bind(this))
                .on('zoom', this.onZoom.bind(this))
                .on('end', this.onZoomEnd.bind(this))
                .scaleExtent(this.props.zoomScaleExtent)
                .translateExtent([
                [0, 0],
                [+Infinity, +Infinity],
            ])
                .filter((e) => e.button === 0 && (typeof this.props.isSelectEvent !== 'function' || !this.props.isSelectEvent(e)));
            if (this.props.zoomWindow != null) {
                this.window = this.props.zoomWindow;
            }
            else {
                const z = zoomIdentity.scale(this.props.zoomScaleTo).translate(this.props.zoomTranslateBy[0], this.props.zoomTranslateBy[1]);
                this.setTransform(z);
            }
        }
        else {
            this.zoomBehavior = null;
        }
        if (typeof this.props.isSelectEvent === 'function') {
            const drag = d3drag()
                .container(function () {
                return this;
            })
                .on('start', this.onDragStart.bind(this))
                .on('drag', this.onDrag.bind(this))
                .on('end', this.onDragEnd.bind(this))
                .filter((e) => e.button === 0 && typeof this.props.isSelectEvent === 'function' && this.props.isSelectEvent(e));
            $parent.call(drag).on('click', (e) => this.onClick(e));
        }
        if (this.hasTooltips()) {
            $parent.on('mouseleave', (e) => this.onMouseLeave(e)).on('mousemove', (e) => this.onMouseMove(e));
        }
        this.parent.classList.add(TDP_SCATTERPLOT_CSS_PREFIX);
    }
    get node() {
        return this.parent;
    }
    initDOM(extraMarkup = '') {
        // init dom
        this.parent.innerHTML = `
      <canvas class="${TDP_SCATTERPLOT_CSS_PREFIX}-data-layer"></canvas>
      <canvas class="${TDP_SCATTERPLOT_CSS_PREFIX}-selection-layer" ${typeof this.props.isSelectEvent !== 'function' && this.props.extras == null ? 'style="visibility: hidden"' : ''}></canvas>
      <div class="${TDP_SCATTERPLOT_CSS_PREFIX}-draw-area"  style="left: ${this.props.marginLeft}px; right: ${this.props.marginRight}px; top: ${this.props.marginTop}px; bottom: ${this.props.marginBottom}px"></div>
      <svg class="${TDP_SCATTERPLOT_CSS_PREFIX}-axis-left" style="width: ${this.props.marginLeft + 2}px;">
        <g transform="translate(${this.props.marginLeft},${this.props.marginTop})"><g>
      </svg>
      <svg class="${TDP_SCATTERPLOT_CSS_PREFIX}-axis-bottom" style="height: ${this.props.marginBottom}px;">
        <g transform="translate(${this.props.marginLeft},0)"><g>
      </svg>
      <div class="${TDP_SCATTERPLOT_CSS_PREFIX}-axis-bottom-label" style="left: ${this.props.marginLeft + 2}px; right: ${this.props.marginRight}px"><div>${this.props.xlabel}</div></div>
      <div class="${TDP_SCATTERPLOT_CSS_PREFIX}-axis-left-label"  style="top: ${this.props.marginTop + 2}px; bottom: ${this.props.marginBottom}px"><div>${this.props.ylabel}</div></div>
      ${extraMarkup}
    `;
        if (!this.zoomBehavior) {
            return;
        }
        select(this.parent)
            .select(`.${TDP_SCATTERPLOT_CSS_PREFIX}-draw-area`)
            .call(this.zoomBehavior)
            .on('wheel', (e) => e.preventDefault());
    }
    setDataImpl(data) {
        // generate a quad tree out of the data
        // work on a normalized dimension within the quadtree to
        // * be independent of the current pixel size
        // * but still consider the mapping function (linear, pow, log) from the data domain
        const domain2normalizedX = this.props.xscale.copy().range(this.normalized2pixel.x.domain());
        const domain2normalizedY = this.props.yscale.copy().range(this.normalized2pixel.y.domain());
        this.tree = quadtree(data, (d) => domain2normalizedX(this.props.x(d)), (d) => domain2normalizedY(this.props.y(d)));
    }
    set data(data) {
        this.setDataImpl(data);
        this.selectionTree = quadtree([], this.tree.x(), this.tree.y());
        this.render(ERenderReason.DIRTY);
    }
    get data() {
        return this.tree ? this.tree.data() : [];
    }
    /**
     * returns the total domain
     * @returns {{xMinMax: number[], yMinMax: number[]}}
     */
    get domain() {
        return {
            xMinMax: this.props.xscale.domain(),
            yMinMax: this.props.yscale.domain(),
        };
    }
    hasTooltips() {
        return this.props.showTooltip != null && this.props.showTooltip !== false;
    }
    resized() {
        this.render(ERenderReason.DIRTY);
    }
    getMouseNormalizedPos(canvasPixelPox = this.mousePosAtCanvas()) {
        const { n2pX, n2pY } = this.transformedNormalized2PixelScales();
        function range(r) {
            return Math.abs(r[1] - r[0]);
        }
        const computeClickRadius = () => {
            // compute the data domain radius based on xscale and the scaling factor
            const view = this.props.clickRadius;
            const transform = this.currentTransform;
            const { scale } = this.props;
            const kX = scale === EScaleAxes.x || scale === EScaleAxes.xy ? transform.k : 1;
            const kY = scale === EScaleAxes.y || scale === EScaleAxes.xy ? transform.k : 1;
            const viewSizeX = kX * range(this.normalized2pixel.x.range());
            const viewSizeY = kY * range(this.normalized2pixel.y.range());
            // transform from view to data without translation
            const normalizedRangeX = range(this.normalized2pixel.x.domain());
            const normalizedRangeY = range(this.normalized2pixel.y.domain());
            const normalizedX = (view / viewSizeX) * normalizedRangeX;
            const normalizedY = (view / viewSizeY) * normalizedRangeY;
            // const view = this.props.xscale(base)*transform.k - this.props.xscale.range()[0]; //skip translation
            // debuglog(view, viewSize, transform.k, normalizedSize, normalized);
            return [normalizedX, normalizedY];
        };
        const [clickRadiusX, clickRadiusY] = computeClickRadius();
        return { x: n2pX.invert(canvasPixelPox[0]), y: n2pY.invert(canvasPixelPox[1]), clickRadiusX, clickRadiusY };
    }
    /**
     * returns the current selection
     */
    get selection() {
        if (typeof this.props.isSelectEvent !== 'function') {
            return [];
        }
        return this.selectionTree.data();
    }
    /**
     * sets the current selection
     * @param selection
     */
    set selection(selection) {
        this.setSelection(selection);
    }
    setSelection(selection) {
        return this.setSelectionImpl(selection);
    }
    setSelectionImpl(selection, inProgress = false) {
        if (typeof this.props.isSelectEvent !== 'function') {
            return false;
        }
        if (selection == null) {
            selection = []; // ensure valid value
        }
        // this.lasso.clear();
        if (selection.length === 0) {
            return this.clearSelectionImpl(inProgress);
        }
        // find the delta
        let changed = false;
        const s = this.selection.slice();
        selection.forEach((sNew) => {
            const i = s.indexOf(sNew);
            if (i < 0) {
                // new
                this.selectionTree.add(sNew);
                changed = true;
            }
            else {
                s.splice(i, 1); // mark as used
            }
        });
        changed = changed || s.length > 0;
        // remove removed items
        this.selectionTree.removeAll(s);
        if (changed) {
            this.emit(inProgress ? AScatterplot.EVENT_SELECTION_IN_PROGRESS_CHANGED : AScatterplot.EVENT_SELECTION_CHANGED, this);
            this.render(ERenderReason.SELECTION_CHANGED);
        }
        return changed;
    }
    /**
     * clears the selection, same as .selection=[]
     */
    clearSelection() {
        return this.clearSelection();
    }
    clearSelectionImpl(inProgress = false) {
        const changed = this.selectionTree !== null && this.selectionTree.size() > 0;
        if (changed) {
            this.selectionTree = quadtree([], this.tree.x(), this.tree.y());
            this.emit(inProgress ? AScatterplot.EVENT_SELECTION_IN_PROGRESS_CHANGED : AScatterplot.EVENT_SELECTION_CHANGED, this);
            this.render(ERenderReason.SELECTION_CHANGED);
        }
        return changed;
    }
    /**
     * shortcut to add items to the selection
     * @param items
     */
    addToSelection(items) {
        if (items.length === 0 || typeof this.props.isSelectEvent !== 'function') {
            return false;
        }
        this.selectionTree.addAll(items);
        this.emit(AScatterplot.EVENT_SELECTION_CHANGED, this);
        this.render(ERenderReason.SELECTION_CHANGED);
        return true;
    }
    /**
     * shortcut to remove items from the selection
     * @param items
     */
    removeFromSelection(items) {
        if (items.length === 0 || typeof this.props.isSelectEvent !== 'function') {
            return false;
        }
        this.selectionTree.removeAll(items);
        this.emit(AScatterplot.EVENT_SELECTION_CHANGED, this);
        this.render(ERenderReason.SELECTION_CHANGED);
        return true;
    }
    selectWithTester(tester, inProgress = false) {
        const selection = QuadtreeUtils.findByTester(this.tree, tester);
        return this.setSelectionImpl(selection, inProgress);
    }
    checkResize() {
        const c = this.canvasDataLayer;
        if (c.width !== c.clientWidth || c.height !== c.clientHeight) {
            const oldWidth = this.canvasSelectionLayer.width;
            const oldHeight = this.canvasSelectionLayer.height;
            this.canvasSelectionLayer.width = c.width = c.clientWidth;
            this.canvasSelectionLayer.height = c.height = c.clientHeight;
            this.adaptMaxTranslation(oldWidth, oldHeight);
            return true;
        }
        return false;
    }
    /**
     * adapt the current translation (is absolute in pixels) and consider if the dimensions of the canvas element have changed
     */
    adaptMaxTranslation(oldWidth, oldHeight) {
        if (!this.zoomBehavior) {
            return;
        }
        const availableWidth = this.canvasDataLayer.width - this.props.marginLeft - this.props.marginRight;
        const availableHeight = this.canvasDataLayer.height - this.props.marginTop - this.props.marginBottom;
        const oldAvailableWidth = oldWidth - this.props.marginLeft - this.props.marginRight;
        const oldAvailableHeight = oldHeight - this.props.marginTop - this.props.marginBottom;
        const current = this.currentTransform;
        // compute factors to consider the element's new dimensions
        const factorX = availableWidth / oldAvailableWidth;
        const factorY = availableHeight / oldAvailableHeight;
        this.zoomBehavior
            .extent([
            [0, 0],
            [availableWidth, availableHeight],
        ])
            .translateExtent([
            [0, 0],
            [availableWidth, availableHeight],
        ]);
        // set the new transform by considering the factors
        this.setTransform(zoomIdentity.translate(current.x * factorX, current.y * factorY).scale(current.k));
    }
    rescale(axis, scale) {
        const c = this.currentTransform;
        const p = this.props.scale;
        // eslint-disable-next-line default-case
        switch (axis) {
            case EScaleAxes.x:
                return p === EScaleAxes.x || p === EScaleAxes.xy ? c.rescaleX(scale) : scale;
            case EScaleAxes.y:
                return p === EScaleAxes.y || p === EScaleAxes.xy ? c.rescaleY(scale) : scale;
        }
        throw new Error('Not Implemented');
    }
    mousePosAtCanvas() {
        const pos = pointer(this.parent);
        // shift by the margin since the scales doesn't include them for better scaling experience
        return [pos[0] - this.props.marginLeft, pos[1] - this.props.marginTop];
    }
    setTransform(transform) {
        if (!this.zoomBehavior) {
            return;
        }
        const $zoom = select(this.parent).select(`.${TDP_SCATTERPLOT_CSS_PREFIX}-draw-area`);
        this.zoomBehavior.on('start', null).on('zoom', null).on('end', null);
        this.zoomBehavior.transform($zoom, (this.currentTransform = transform));
        this.zoomBehavior.on('start', this.onZoomStart.bind(this)).on('zoom', this.onZoom.bind(this)).on('end', this.onZoomEnd.bind(this));
    }
    window2transform(window) {
        const range2transform = (minMax, scale, coordinateSystemOrigin) => {
            const scaledWindowAxisMin = scale(minMax[0]);
            const scaledWindowAxisMax = scale(minMax[1]);
            const pmin = Math.min(scaledWindowAxisMin, scaledWindowAxisMax);
            const pmax = Math.max(scaledWindowAxisMin, scaledWindowAxisMax);
            const rangeMin = Math.min(scale.range()[0], scale.range()[1]);
            const rangeMax = Math.max(scale.range()[0], scale.range()[1]);
            const k = (rangeMax - rangeMin) / (pmax - pmin);
            return { k, t: coordinateSystemOrigin - pmin };
        };
        const s = this.props.scale;
        const x = s === EScaleAxes.x || s === EScaleAxes.xy ? range2transform(window.xMinMax, this.props.xscale, this.props.xscale.range()[0]) : null;
        const y = s === EScaleAxes.y || s === EScaleAxes.xy ? range2transform(window.yMinMax, this.props.yscale, this.props.yscale.range()[1]) : null;
        let k = 1;
        if (x && y) {
            k = Math.min(x.k, y.k);
        }
        else if (x) {
            k = x.k;
        }
        else if (y) {
            k = y.k;
        }
        return {
            k,
            tx: x ? x.t : 0,
            ty: y ? y.t : 0,
        };
    }
    /**
     * returns the current visible window
     * @returns {{xMinMax: [number,number], yMinMax: [number,number]}}
     */
    get window() {
        const { x: xscale, y: yscale } = this.transformedScales();
        return {
            xMinMax: xscale.range().map(xscale.invert.bind(xscale)),
            yMinMax: yscale.range().map(yscale.invert.bind(yscale)),
        };
    }
    /**
     * sets the current visible window
     * @param window
     */
    set window(window) {
        if (!this.zoomBehavior) {
            return;
        }
        const { k, tx, ty } = this.window2transform(window);
        this.setTransform(zoomIdentity.scale(k).translate(tx, ty));
        this.node.classList.toggle(`${EScaleAxes[this.props.scale]}-zoomed`, this.isZoomed());
        this.render();
    }
    onZoomStart() {
        this.zoomStartTransform = this.currentTransform;
    }
    isZoomed() {
        return this.currentTransform.k !== 1;
    }
    shiftTransform(t) {
        // zoom transform is over the whole canvas an not just the center part in which the scales are defined
        return t;
    }
    onZoom(evt) {
        const newValue = this.shiftTransform(evt.transform);
        const oldValue = this.currentTransform;
        this.currentTransform = newValue;
        const { scale } = this.props;
        const tchanged = (scale !== EScaleAxes.y && oldValue.x !== newValue.x) || (scale !== EScaleAxes.x && oldValue.y !== newValue.y);
        const schanged = oldValue.k !== newValue.k;
        const delta = {
            x: scale === EScaleAxes.x || scale === EScaleAxes.xy ? newValue.x - oldValue.x : 0,
            y: scale === EScaleAxes.y || scale === EScaleAxes.xy ? newValue.y - oldValue.y : 0,
            kx: scale === EScaleAxes.x || scale === EScaleAxes.xy ? newValue.k / oldValue.k : 1,
            ky: scale === EScaleAxes.y || scale === EScaleAxes.xy ? newValue.k / oldValue.k : 1,
        };
        if (tchanged && schanged) {
            this.emit(AScatterplot.EVENT_WINDOW_CHANGED, this.window, this.transformedScales());
            this.render(ERenderReason.PERFORM_SCALE_AND_TRANSLATE, delta);
        }
        else if (schanged) {
            this.emit(AScatterplot.EVENT_WINDOW_CHANGED, this.window, this.transformedScales());
            this.render(ERenderReason.PERFORM_SCALE, delta);
        }
        else if (tchanged) {
            this.emit(AScatterplot.EVENT_WINDOW_CHANGED, this.window, this.transformedScales());
            this.render(ERenderReason.PERFORM_TRANSLATE, delta);
        }
        // nothing if no change
        this.emit(AScatterplot.EVENT_ZOOM_CHANGED, evt);
    }
    onZoomEnd() {
        const start = this.zoomStartTransform;
        const end = this.currentTransform;
        const tchanged = start.x !== end.x || start.y !== end.y;
        const schanged = start.k !== end.k;
        this.node.classList.toggle(`${EScaleAxes[this.props.scale]}-zoomed`, this.isZoomed());
        if (tchanged && schanged) {
            this.render(ERenderReason.AFTER_SCALE_AND_TRANSLATE);
        }
        else if (schanged) {
            this.render(ERenderReason.AFTER_SCALE);
        }
        else if (tchanged) {
            this.render(ERenderReason.AFTER_TRANSLATE);
        }
    }
    onDragStart(e) {
        this.lasso.start(e.x, e.y);
        if (!this.clearSelectionImpl(true)) {
            this.render(ERenderReason.SELECTION_CHANGED);
        }
    }
    onDrag(e) {
        if (this.dragHandle < 0) {
            this.dragHandle = window.setInterval(this.updateDrag.bind(this), this.props.lasso.interval);
        }
        this.lasso.setCurrent(e.x, e.y);
        this.render(ERenderReason.SELECTION_CHANGED);
        this.emit(AScatterplot.EVENT_DRAGGED, e);
    }
    updateDrag() {
        if (this.lasso.pushCurrent()) {
            this.retestLasso();
        }
    }
    onDragEnd(e) {
        clearInterval(this.dragHandle);
        this.dragHandle = -1;
        this.lasso.end(e.x, e.y);
        if (!this.retestLasso()) {
            this.render(ERenderReason.SELECTION_CHANGED);
        }
        this.lasso.clear();
        this.emit(AScatterplot.EVENT_SELECTION_CHANGED, this);
    }
    retestLasso() {
        const { n2pX, n2pY } = this.transformedNormalized2PixelScales();
        // shift by the margin since the scales doesn't include them for better scaling experience
        const tester = this.lasso.tester(n2pX.invert.bind(n2pX), n2pY.invert.bind(n2pY), -this.props.marginLeft, -this.props.marginTop);
        return tester && this.selectWithTester(tester, true);
    }
    onClick(event) {
        if (event.button > 0) {
            // right button or something like that = reset
            this.selection = [];
            return;
        }
        const { x, y, clickRadiusX, clickRadiusY } = this.getMouseNormalizedPos();
        // find closest data item
        const tester = QuadtreeUtils.ellipseTester(x, y, clickRadiusX, clickRadiusY);
        this.selectWithTester(tester);
        this.emit(AScatterplot.EVENT_MOUSE_CLICKED, event);
    }
    showTooltip(canvasPos, event) {
        const items = this.findItems(canvasPos);
        // canvas pos doesn't include the margin
        this.props.showTooltip(this.parent, items, canvasPos[0] + this.props.marginLeft, canvasPos[1] + this.props.marginTop, event);
        this.showTooltipHandle = -1;
    }
    findItems(canvasPos) {
        const { x, y, clickRadiusX, clickRadiusY } = this.getMouseNormalizedPos(canvasPos);
        const tester = QuadtreeUtils.ellipseTester(x, y, clickRadiusX, clickRadiusY);
        return QuadtreeUtils.findByTester(this.tree, tester);
    }
    onMouseMove(event) {
        if (this.showTooltipHandle >= 0) {
            this.onMouseLeave(event);
        }
        const pos = this.mousePosAtCanvas();
        // TODO find a more efficient way or optimize the timing
        this.showTooltipHandle = window.setTimeout(this.showTooltip.bind(this, pos, event), this.props.tooltipDelay);
        this.emit(AScatterplot.EVENT_MOUSE_MOVED, event);
    }
    onMouseLeave(event) {
        clearTimeout(this.showTooltipHandle);
        this.showTooltipHandle = -1;
        this.props.showTooltip(this.parent, [], 0, 0, event);
    }
    traverseTree(ctx, tree, renderer, xscale, yscale, isNodeVisible, 
    // eslint-disable-next-line @typescript-eslint/default-param-last
    debug = false, x, y) {
        // debug stats
        let rendered = 0;
        let aggregated = 0;
        let hidden = 0;
        const { n2pX, n2pY } = this.transformedNormalized2PixelScales();
        const visitTree = (node, x0, y0, x1, y1) => {
            if (!isNodeVisible(x0, y0, x1, y1)) {
                hidden += debug ? QuadtreeUtils.getTreeSize(node) : 0;
                return QuadtreeUtils.ABORT_TRAVERSAL;
            }
            if (this.useAggregation(n2pX, n2pY, x0, y0, x1, y1)) {
                const d = QuadtreeUtils.getFirstLeaf(node);
                // debuglog('aggregate', getTreeSize(node));
                rendered++;
                aggregated += debug ? QuadtreeUtils.getTreeSize(node) - 1 : 0;
                renderer.render(xscale(x(d)), yscale(y(d)), d);
                return QuadtreeUtils.ABORT_TRAVERSAL;
            }
            if (QuadtreeUtils.isLeafNode(node)) {
                // is a leaf
                rendered += QuadtreeUtils.forEachLeaf(node, (d) => renderer.render(xscale(x(d)), yscale(y(d)), d));
            }
            return QuadtreeUtils.CONTINUE_TRAVERSAL;
        };
        ctx.save();
        tree.visit(visitTree);
        renderer.done();
        if (debug) {
            TDP_SCATTERPLOT_DEBUGLOG('rendered', rendered, 'aggregated', aggregated, 'hidden', hidden, 'total', this.tree.size());
        }
        // a dummy path to clear the 'to draw' state
        ctx.beginPath();
        ctx.closePath();
        ctx.restore();
    }
    setAxisFormat(axis, key) {
        const f = this.props.format[key];
        if (f != null) {
            axis.tickFormat(typeof f === 'string' ? format(f) : f);
        }
        const t = this.props.ticks[key];
        if (t != null) {
            axis.tickValues(Array.isArray(t) ? t : t(axis.scale()));
        }
    }
    transformData(c, bounds, boundsWidth, boundsHeight, x, y, kx, ky) {
        // idea copy the data layer to selection layer in a transformed way and swap
        const ctx = this.canvasSelectionLayer.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.save();
        ctx.rect(bounds.x0, bounds.y0, boundsWidth, boundsHeight);
        ctx.clip();
        // ctx.translate(bounds.x0, bounds.y0+bounds_height); //move to visible area
        // debuglog(x,y,k, bounds.x0, bounds.y0, n2pX(0), n2pY(100), this.currentTransform.x, this.currentTransform.y);
        // ctx.scale(k,k);
        // ctx.translate(0, -bounds_height); //move to visible area
        ctx.translate(x, y);
        // copy just the visible area
        // canvas, clip area, target area
        // see http://www.w3schools.com/tags/canvas_drawimage.asp
        ctx.drawImage(this.canvasDataLayer, bounds.x0, bounds.y0, boundsWidth, boundsHeight, bounds.x0, bounds.y0, boundsWidth * kx, boundsHeight * ky);
        ctx.restore();
        // swap and update class names
        [this.canvasDataLayer, this.canvasSelectionLayer] = [this.canvasSelectionLayer, this.canvasDataLayer];
        this.canvasDataLayer.className = `${TDP_SCATTERPLOT_CSS_PREFIX}-data-layer`;
        this.canvasSelectionLayer.className = `${TDP_SCATTERPLOT_CSS_PREFIX}-selection-layer`;
    }
    useAggregation(n2pX, n2pY, x0, y0, x1, y1) {
        x0 = n2pX(x0);
        y0 = n2pY(y0);
        x1 = n2pX(x1);
        y1 = n2pY(y1);
        const minSize = Math.max(Math.abs(x0 - x1), Math.abs(y0 - y1));
        return minSize < 5; // TODO tune depend on visual impact
    }
}
AScatterplot.EVENT_SELECTION_CHANGED = 'selectionChanged';
AScatterplot.EVENT_SELECTION_IN_PROGRESS_CHANGED = 'selectionInProgressChanged';
AScatterplot.EVENT_RENDER = 'render';
AScatterplot.EVENT_WINDOW_CHANGED = 'windowChanged';
AScatterplot.EVENT_MOUSE_CLICKED = 'mouseClicked';
AScatterplot.EVENT_DRAGGED = 'dragged';
AScatterplot.EVENT_MOUSE_MOVED = 'mouseMoved';
AScatterplot.EVENT_ZOOM_CHANGED = 'zoomChanged';
//# sourceMappingURL=AScatterplot.js.map