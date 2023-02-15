import * as d3v3 from 'd3v3';
import marked from 'marked';
import { merge } from 'lodash';
import { I18nextManager } from 'visyn_core/i18n';
import { SelectionUtils } from 'visyn_core/idtype';
import { ModeWrapper } from './mode';
import { AppContext } from '../../app';
import { BaseUtils } from '../../base/BaseUtils';
import { StoryTransition } from './Player';
const modeFeatures = {
    isEditable: () => ModeWrapper.getInstance().getMode().authoring > 0.8,
};
/**
 * place where the annotation is attached to an anchor
 */
var EAnchorDirection;
(function (EAnchorDirection) {
    EAnchorDirection[EAnchorDirection["EAST"] = 0] = "EAST";
    EAnchorDirection[EAnchorDirection["NORTH"] = 1] = "NORTH";
    EAnchorDirection[EAnchorDirection["WEST"] = 2] = "WEST";
    EAnchorDirection[EAnchorDirection["SOUTH"] = 3] = "SOUTH";
    EAnchorDirection[EAnchorDirection["NORTH_EAST"] = 4] = "NORTH_EAST";
    EAnchorDirection[EAnchorDirection["NORTH_WEST"] = 5] = "NORTH_WEST";
    EAnchorDirection[EAnchorDirection["SOUTH_EAST"] = 6] = "SOUTH_EAST";
    EAnchorDirection[EAnchorDirection["SOUTH_WEST"] = 7] = "SOUTH_WEST";
    EAnchorDirection[EAnchorDirection["CENTER"] = 8] = "CENTER";
})(EAnchorDirection || (EAnchorDirection = {}));
const anchor2string = (() => {
    const r = [];
    r[EAnchorDirection.EAST] = 'e';
    r[EAnchorDirection.NORTH] = 'n';
    r[EAnchorDirection.WEST] = 'w';
    r[EAnchorDirection.SOUTH] = 's';
    r[EAnchorDirection.NORTH_EAST] = 'ne';
    r[EAnchorDirection.NORTH_WEST] = 'nw';
    r[EAnchorDirection.SOUTH_EAST] = 'se';
    r[EAnchorDirection.SOUTH_WEST] = 'sw';
    r[EAnchorDirection.CENTER] = 'c';
    return r;
})();
const string2anchor = {
    e: EAnchorDirection.EAST,
    n: EAnchorDirection.NORTH,
    w: EAnchorDirection.WEST,
    s: EAnchorDirection.SOUTH,
    ne: EAnchorDirection.NORTH_EAST,
    nw: EAnchorDirection.NORTH_WEST,
    se: EAnchorDirection.SOUTH_EAST,
    sw: EAnchorDirection.SOUTH_WEST,
    c: EAnchorDirection.CENTER,
};
/**
 * An anchor is a flexible position at a DOM element
 */
class Anchor {
    constructor(elem, anchor, lazy = false) {
        this.elem = elem;
        this.anchor = anchor;
        /**
         * position of the anchor
         * @type {null}
         * @private
         */
        this._pos = null;
        if (!lazy) {
            this._pos = this.compute();
        }
    }
    /**
     * returns the square distance of this anchor point to the given point
     * @param pos the current point
     * @returns {number} the square distance
     */
    distance(pos) {
        const p = this.pos;
        const dx = pos[0] - p[0];
        const dy = pos[1] - p[1];
        return dx * dx + dy * dy;
    }
    get pos() {
        return this._pos !== null ? this._pos : this.compute();
    }
    /**
     * checks wether the anchor position has changed and updates its position accordingly
     * @returns {boolean} true if there was a change
     */
    checkForPositionChange() {
        const old = this.pos;
        const newValue = (this._pos = this.compute());
        return Math.abs(old[0] - newValue[0]) > 1 || Math.abs(old[1] - newValue[1]) > 1;
    }
    compute() {
        // start with the bounds
        const o = BaseUtils.bounds(this.elem);
        // add offset
        o.x += window.pageXOffset;
        o.y += window.pageYOffset;
        // select direction
        switch (this.anchor) {
            case EAnchorDirection.EAST:
                return [o.x, o.y + o.h / 2 - 3];
            case EAnchorDirection.NORTH:
                return [o.x + o.w / 2 - 3, o.y];
            case EAnchorDirection.WEST:
                return [o.x + o.w - 5, o.y + o.h / 2 - 3];
            case EAnchorDirection.SOUTH:
                return [o.x + o.w / 2 - 3, o.y + o.h - 5];
            case EAnchorDirection.NORTH_EAST:
                return [o.x, o.y];
            case EAnchorDirection.NORTH_WEST:
                return [o.x + o.w - 6, o.y];
            case EAnchorDirection.SOUTH_EAST:
                return [o.x, o.y + o.h - 5];
            case EAnchorDirection.SOUTH_WEST:
                return [o.x + o.w - 5, o.y + o.h - 5];
            default:
                return [o.x + o.w / 2 - 3, o.y + o.h / 2 - 3];
        }
    }
    /**
     * returns the ids identifying this anchor based on the data-anchor DOM attribute
     * @returns {string}
     */
    toString() {
        return `${this.elem.getAttribute('data-anchor')}@${anchor2string[this.anchor]}`;
    }
    /**
     * converts the given encoded anchor string to its DOM element
     * @param s
     * @returns {Anchor}
     */
    static fromString(s, lazy = true) {
        const parts = s.split('@');
        const elem = document.querySelector(`*[data-anchor="${parts[0]}"]`);
        const anchor = string2anchor[parts[1]];
        return new Anchor(elem, anchor, lazy);
    }
}
class AnchorWatcher {
    constructor() {
        this.anchors = [];
        this.intervall = -1;
    }
    add(anchor, callback) {
        this.anchors.push({ anchor: Anchor.fromString(anchor, false), callback });
        if (this.intervall < 0) {
            this.watch();
        }
    }
    check() {
        this.anchors.forEach((entry) => {
            if (entry.anchor.checkForPositionChange()) {
                entry.callback();
            }
        });
    }
    watch() {
        this.intervall = window.setInterval(this.check.bind(this), AnchorWatcher.UPDATE_INTERVALL);
    }
    clear() {
        if (this.intervall >= 0) {
            clearInterval(this.intervall);
            this.intervall = -1;
        }
        this.anchors = [];
    }
}
AnchorWatcher.UPDATE_INTERVALL = 100;
export class Renderer {
    constructor($main, graph, options = {}) {
        this.$main = $main;
        this.graph = graph;
        this.options = {
            /**
             * should animations for the annotations being used
             */
            animation: true,
            /**
             * animation duration
             */
            duration: 100,
            /**
             * should text annotations being rendered as markdown
             */
            markdown: true,
            /**
             * render a subtitle annotation containing the predefined content
             */
            renderSubtitle: false,
            /**
             * subtitle content
             */
            // eslint-disable-next-line no-template-curly-in-string
            subtitlePattern: '${description}',
        };
        this.prev = Promise.resolve(null);
        this.l = (event, state, type, op, extras) => this.render(state, extras.withTransition !== false);
        this.updateAnnotations = () => this.renderAnnotationsImpl(this.act);
        this.rerender = () => this.render(this.act, true, true);
        this.act = null;
        this.renderer = this.rendererImpl.bind(this);
        this.anchorWatcher = new AnchorWatcher();
        merge(this.options, options);
        // update during slide change
        this.graph.on(`select_slide_${SelectionUtils.defaultSelectionType}`, this.l);
        // and mode change
        ModeWrapper.getInstance().on('modeChanged', this.rerender);
        AppContext.getInstance().onDOMNodeRemoved($main.node(), this.destroy.bind(this));
    }
    /**
     * renders the given text by replacing variables and rendering markdown, then return the HTML code to display
     *
     * variables: usage: `${variable_name}`
     *  * name ... current slide name
     *  * description ... current slide description
     *  * duration ... current slide duration
     *  * slide_number ... current slide Index
     *  * state_name ... if the slide is associated with a state: its name
     *  * state_notes ... if the slide is associated with a state: its notes
     *  * action_name ... if the state was created by some action, its name
     *  * action_category ... the category of the action (data, vis,...)
     *  * action_operation ... the operation (create, update, delete)
     *  * action_user ... the user performed the operation
     *  * action_ts .. the date when the action was executed
     *
     * @param d the text to render
     * @returns {String}
     */
    rendererImpl(d) {
        if (modeFeatures.isEditable() && d.length === 0) {
            // return placeholder
            return `<i class="placeholder">${I18nextManager.getInstance().i18n.t('phovea:clue.annotationPlaceholder')}</i>`;
        }
        // replace variables within the text
        if (this.act) {
            // vars contains all possible variables
            const vars = {
                name: this.act.name,
                description: this.act.description,
                duration: this.act.duration,
                slide_number: this.act.slideIndex,
            };
            const s = this.act.state;
            if (s) {
                vars.state_name = s.name;
                vars.state_notes = s.getAttr('notes');
                const a = s.creator;
                if (a) {
                    const aa = a.meta;
                    vars.action_name = aa.name;
                    vars.action_category = aa.category;
                    vars.action_operation = aa.operation;
                    vars.action_user = aa.user;
                    vars.action_ts = new Date(aa.timestamp);
                }
            }
            d = this.replaceVariables(d, vars);
        }
        return this.options.markdown ? marked(d) : d;
    }
    replaceVariables(d, vars) {
        return d.replace(/\$\{([^}]+)\}/gi, function (match, variable) {
            const r = vars[variable];
            if (r) {
                return r;
            }
            return `\${${variable}}?`;
        });
    }
    destroy() {
        this.graph.off(`select_slide_${SelectionUtils.defaultSelectionType}`, this.l);
        ModeWrapper.getInstance().off('modeChanged', this.rerender);
    }
    render(state, withTransition = true, waitBetweenTakeDown = false) {
        if (this.act) {
            // disable annotation update listener
            this.act.off('push-annotations,attr-name,attr-duration', this.updateAnnotations);
        }
        // create full chain
        this.prev = this.prev.then(async () => {
            // hide old annotations
            const takedown = this.hideOld();
            this.act = state;
            if (!state) {
                return takedown;
            }
            // listen to annotation changes
            this.act.on('push-annotations,attr-name,attr-duration', this.updateAnnotations);
            // no annotations should be shown
            if (ModeWrapper.getInstance().getMode().exploration > 0.8) {
                return takedown;
            }
            // wait 1sec till the previous annotations are removed
            await takedown;
            await BaseUtils.resolveIn(waitBetweenTakeDown ? 1000 : 0);
            let next = null;
            if (state.isTextOnly) {
                // no state jump
                next = this.renderText(state);
            }
            else {
                // jump to next state
                next = this.graph.jumpTo(state.state, state.transition <= 0 || !withTransition ? StoryTransition.MIN_TRANSITION : state.transition * StoryTransition.FACTOR);
            }
            await next;
            const all = [this.renderAnnotations(state)];
            if (this.options.renderSubtitle) {
                all.push(this.renderSubtitle(state));
            }
            return Promise.all(all);
        });
        return this.prev;
    }
    /**
     * renders anchor hits
     * @param bounds the parent bounds where the anchors are rendered into
     */
    renderAnchors(bounds) {
        const mainNode = this.$main.node();
        const anchorElements = [].slice.apply(mainNode.querySelectorAll('*[data-anchor]'));
        if (mainNode.getAttribute('data-anchor') != null) {
            anchorElements.push(mainNode);
        }
        const anchors = [];
        // create anchors
        anchorElements.forEach((a) => {
            const b = BaseUtils.bounds(a);
            if (b.w * b.h < 50 * 50) {
                // area to small for higher details
                anchors.push(new Anchor(a, EAnchorDirection.CENTER));
            }
            else {
                anchors.push.apply(anchors, Object.keys(string2anchor).map((s) => new Anchor(a, string2anchor[s])));
            }
        });
        const $anchors = this.$main.selectAll('div.annotation-anchor').data(anchors);
        $anchors.enter().append('div').classed('annotation-anchor', true);
        $anchors.style({
            display: null,
            left: (d) => `${d.pos[0] + -bounds.x}px`,
            top: (d) => `${d.pos[1] - bounds.y}px`,
        });
        $anchors.exit().remove();
    }
    /**
     * updates all anchors by computing the one with the minimal distance and highlight it
     * @param pos current position
     * @param bounds bounds of the parent element containing the anchors
     * @returns {any}
     */
    updateAnchor(pos, bounds) {
        const $anchors = this.$main.selectAll('div.annotation-anchor');
        if ($anchors.empty()) {
            // no anchors
            return null;
        }
        const abspos = [pos[0] + bounds.x, pos[1] + bounds.y];
        let minV = Number.POSITIVE_INFINITY;
        let minAnchor = null;
        $anchors.each((d) => {
            const distance = d.distance(abspos);
            if (distance < minV) {
                minAnchor = d;
                minV = distance;
            }
        });
        $anchors.classed('closest', (d, i) => d === minAnchor);
        if (minAnchor) {
            return {
                anchor: minAnchor.toString(),
                offset: [abspos[0] - minAnchor.pos[0], abspos[1] - minAnchor.pos[1]],
            };
        }
        // no anchor relative version
        return [(pos[0] * 100) / bounds.w, (pos[1] * 100) / bounds.h];
    }
    removeAnchors() {
        this.$main.selectAll('div.annotation-anchor').style('display', 'none').remove();
    }
    renderAnnotationsImpl(state) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        const editable = modeFeatures.isEditable() && state != null;
        const $anns = this.$main.selectAll('div.annotation').data(state ? state.annotations : [], (d, i) => `${state.id}@${d.type}${i}`);
        const $annsEnter = $anns
            .enter()
            .append('div')
            .attr('class', (d) => `${d.type}-annotation annotation`);
        const bounds = BaseUtils.bounds(this.$main.node());
        function updatePos(d) {
            const elem = this;
            const p = d.pos;
            if (Array.isArray(p)) {
                // relative
                elem.style.left = `${p[0]}%`;
                elem.style.top = `${p[1]}%`;
            }
            else {
                // anchor based
                const anchor = Anchor.fromString(p.anchor);
                const base = anchor.pos;
                elem.style.left = `${base[0] - bounds.x + p.offset[0]}px`;
                elem.style.top = `${base[1] - bounds.y + p.offset[1]}px`;
            }
        }
        this.anchorWatcher.clear();
        function watchAnchor(d) {
            const p = d.pos;
            if (!Array.isArray(p)) {
                that.anchorWatcher.add(p.anchor, () => updatePos.call(this, d));
            }
        }
        function updateSize(d) {
            const elem = this;
            const p = d.pos2;
            if (p) {
                // anchor based
                const base = Anchor.fromString(p.anchor).pos;
                const { pos } = Anchor.fromString(d.pos.anchor);
                elem.style.width = `${base[0] + p.offset[0] - pos[0] - d.pos.offset[0]}px`;
                elem.style.height = `${base[1] + p.offset[1] - pos[1] - d.pos.offset[1]}px`;
            }
            else {
                const { size } = d;
                elem.style.width = `${size[0]}%`;
                elem.style.height = `${size[1]}%`;
            }
        }
        function watchSizeAnchor(d) {
            const p = d.pos2;
            if (p) {
                that.anchorWatcher.add(p.anchor, () => updateSize.call(this, d));
            }
        }
        // move
        $annsEnter
            .append('button')
            .attr('tabindex', -1)
            .attr('class', 'btn btn-light btn-sm fas fa-arrows-alt')
            .call(d3v3.behavior
            .drag()
            // .origin((d:prov.IStateAnnotation) => ({x: d.pos[0], y: d.pos[1]}))
            .on('dragstart', function (d, i) {
            that.renderAnchors(bounds);
        })
            .on('dragend', that.removeAnchors.bind(that))
            .on('drag', function (d, i) {
            const mouse = d3v3.mouse(this.parentNode.parentNode);
            d.pos = that.updateAnchor(mouse, bounds);
            state.updateAnnotation(d);
            d3v3.select(this.parentNode).each(updatePos);
        }));
        // remove
        $annsEnter
            .append('button')
            .attr('tabindex', -1)
            .attr('class', 'btn btn-light btn-sm fas fa-times')
            .on('click', function (d, i) {
            d3v3.select(this.parentNode).remove();
            state.removeAnnotationElem(d);
            d3v3.event.preventDefault();
        });
        // Text
        $anns
            .filter((d) => d.type === 'text' || !d.hasOwnProperty('type'))
            .call(($texts, $textsEnter) => {
            const onEdit = function (d, i) {
                const $elem = d3v3.select(this);
                if (!d3v3.select(this.parentNode).classed('editable')) {
                    return;
                }
                $elem.on('click', null);
                $elem
                    .append('textarea')
                    .property('value', d.text)
                    .on('blur', function () {
                    d.text = this.value;
                    state.updateAnnotation(d);
                    // update value and enable edit click handler again
                    $elem.html(that.renderer(this.value)).on('click', onEdit);
                });
            };
            $textsEnter.append('div').classed('text', true).on('click', onEdit);
            $texts
                .select('div.text')
                .html((d) => this.renderer(d.text))
                .style({
                width: (d) => (d.size ? `${d.size[0]}px` : null),
                height: (d) => (d.size ? `${d.size[1]}px` : null),
            })
                .each(function (d) {
                if (d.styles) {
                    d3v3.select(this).style(d.styles);
                }
            });
        }, $annsEnter.filter((d) => d.type === 'text' || !d.hasOwnProperty('type')));
        // Arrow
        $anns
            .filter((d) => d.type === 'arrow')
            .call(($arrows, $arrowsEnter) => {
            const $svgEnter = $arrowsEnter
                .insert('svg', ':first-child')
                .attr({
                width: (d) => 30 + Math.abs(d.at[0]),
                height: (d) => 30 + Math.abs(d.at[1]),
            })
                .style({
                left: (d) => `${-15 + Math.min(0, d.at[0])}px`,
                top: (d) => `${-15 + Math.min(0, d.at[1])}px`,
            });
            $svgEnter
                .append('defs')
                .append('marker')
                .attr({
                id: (d, i) => `clue_text_arrow_marker${i}`,
                viewBox: '0 0 10 10',
                refX: 6,
                refY: 5,
                markerWidth: 4,
                markerHeight: 3,
                markerUnits: 'strokeWidth',
                orient: 'auto',
            })
                .append('path')
                .attr('d', 'M 0 0 L 10 5 L 0 10 z');
            $svgEnter
                .append('g')
                .append('line')
                .classed('arrow', true)
                .attr({
                'marker-end': (d, i) => `url(#clue_text_arrow_marker${i})`,
            });
            const $svg = $arrows.select('svg');
            function updateShift() {
                $svg
                    .attr({
                    width: (d) => 30 + Math.abs(d.at[0]),
                    height: (d) => 30 + Math.abs(d.at[1]), // TODO yminmax[1] - yminmax[0],
                })
                    .style({
                    left: (d) => `${-15 + Math.min(0, d.at[0])}px`,
                    top: (d) => `${-15 + Math.min(0, d.at[1])}px`,
                });
                $svg.select('g').attr('transform', (d) => `translate(${-Math.min(0, d.at[0]) + 15},${-Math.min(0, d.at[1]) + 15})`);
            }
            $svgEnter.select('g').append('circle').classed('anchor', true).attr('r', 5);
            $svg
                .select('circle')
                .style({
                cx: (d) => d.at[0],
                cy: (d) => d.at[1],
            })
                .call(d3v3.behavior.drag().on('drag', function (d, i) {
                const e = d3v3.event;
                d.at = [e.x, e.y];
                state.updateAnnotation(d);
                d3v3.select(this).style({
                    cx: d.at[0],
                    cy: d.at[1],
                });
                $svg.select(`line[data-index="${i}"]`).attr({
                    x2: d.at[0],
                    y2: d.at[1],
                });
                updateShift();
            }));
            updateShift();
            $svg
                .select('line')
                .attr({
                'data-index': (d, i) => i,
                x2: (d) => d.at[0],
                y2: (d) => d.at[1],
            })
                .each(function (d) {
                if (d.styles) {
                    d3v3.select(this).style(d.styles);
                }
            });
        }, $annsEnter.filter((d) => d.type === 'arrow'));
        // FRAME
        $anns
            .filter((d) => d.type === 'frame')
            .call(($frames, $framesEnter) => {
            $frames.each(function (d) {
                updateSize.call(this, d);
                watchSizeAnchor.call(this, d);
                if (d.styles) {
                    d3v3.select(this).style(d.styles);
                }
            });
            // resize
            $framesEnter
                .append('button')
                .attr('tabindex', -1)
                .attr('class', 'btn btn-light btn-sm fas fa-expand fa-flip-horizontal')
                .call(d3v3.behavior
                .drag()
                .on('dragstart', function (d, i) {
                that.renderAnchors(bounds);
            })
                .on('dragend', that.removeAnchors.bind(that))
                .on('drag', function (d, i) {
                const mouse = d3v3.mouse(this.parentNode.parentNode);
                d.pos2 = that.updateAnchor(mouse, bounds);
                state.updateAnnotation(d);
                d3v3.select(this.parentNode).each(updateSize);
            }));
        }, $annsEnter.filter((d) => d.type === 'frame'));
        $anns.each(updatePos).each(watchAnchor).classed('editable', editable);
        $anns.exit().remove();
        return $anns;
    }
    renderAnnotations(state) {
        return new Promise((resolve) => {
            const $anns = this.renderAnnotationsImpl(state);
            if (this.options.animation && !$anns.empty() && this.options.duration > 0) {
                $anns.style('opacity', 0).transition().duration(this.options.duration).style('opacity', 1);
                BaseUtils.resolveIn(this.options.duration + 10).then(() => resolve($anns.node()));
            }
            else {
                $anns.style('opacity', 1);
                resolve($anns.node());
            }
        });
    }
    hideOld() {
        return new Promise((resolve) => {
            this.anchorWatcher.clear();
            const $div = this.$main
                .classed('hide-all-non-annotations', false)
                .selectAll('div.annotation, div.text-overlay, div.add-text-annotation, div.subtitle-annotation');
            if (this.options.animation && !$div.empty() && this.options.duration > 0) {
                $div.transition().duration(this.options.duration).style('opacity', 0).remove();
                BaseUtils.resolveIn(this.options.duration + 10).then(() => resolve());
            }
            else {
                $div.remove();
                resolve();
            }
        });
    }
    renderSubtitle(overlay) {
        return new Promise((resolve) => {
            this.$main.append('div').attr('class', 'subtitle-annotation').html(this.renderer(this.options.subtitlePattern));
            resolve(this.$main.node());
        });
    }
    renderText(overlay) {
        const t = overlay.transition * StoryTransition.FACTOR;
        return BaseUtils.resolveIn(t).then(() => {
            this.$main.classed('hide-all-non-annotations', true);
            return this.$main.node();
        });
    }
    static createAnnotation(main, graph) {
        const instance = new Renderer(d3v3.select(main), graph);
        return {
            render: instance.render.bind(instance),
        };
    }
}
//# sourceMappingURL=annotation.js.map