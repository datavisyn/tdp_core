import * as d3v3 from 'd3v3';
import merge from 'lodash/merge';
// eslint-disable-next-line @typescript-eslint/no-namespace
export var StoryTransition;
(function (StoryTransition) {
    StoryTransition.FACTOR = 1;
    StoryTransition.MIN_DURATION = -1;
    StoryTransition.MIN_TRANSITION = -1;
})(StoryTransition || (StoryTransition = {}));
/**
 * story player interface and logic
 */
export class Player {
    constructor(graph, controls, options = {}) {
        this.graph = graph;
        this.anim = -1;
        this.options = {
            // default animation step duration
            step: 1000,
        };
        merge(this.options, options);
        const $controls = d3v3.select(controls);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        this.$play = $controls.select('[data-player="play"]').on('click', function () {
            const $i = d3v3.select(this);
            if ($i.classed('fa-play') && that.start()) {
                $i.classed('fa-play', false).classed('fa-pause', true);
            }
            else {
                that.pause();
                $i.classed('fa-play', true).classed('fa-pause', false);
            }
        });
        $controls.select('[data-player="stop"]').on('click', function () {
            that.stop();
        });
        $controls.select('[data-player="forward"]').on('click', function () {
            that.forward();
        });
        $controls.select('[data-player="backward"]').on('click', function () {
            that.backward();
        });
        d3v3.select(document).on('keydown.playpause', () => {
            const k = d3v3.event;
            // pause key
            if (k.keyCode === 19) {
                k.preventDefault();
                // fake a click event
                const event = document.createEvent('MouseEvents');
                event.initMouseEvent('click' /* type */, true /* canBubble */, true /* cancelable */, window /* view */, 0 /* detail */, 0 /* screenX */, 0 /* screenY */, 0 /* clientX */, 0 /* clientY */, false /* ctrlKey */, false /* altKey */, false /* shiftKey */, false /* metaKey */, 0 /* button */, null /* relatedTarget */);
                this.$play.node().dispatchEvent(event);
            }
        });
    }
    start() {
        const l = this.graph.getSlideChains();
        const act = this.graph.selectedSlides()[0] || l[l.length - 1];
        if (act) {
            this.render(act).then(() => {
                this.anim = window.setTimeout(this.next.bind(this), act.duration * StoryTransition.FACTOR);
            });
            return true;
        }
        return false;
    }
    render(story) {
        // render by selecting the slide
        this.graph.selectSlide(story);
        // TODO transition time
        return Promise.resolve(story);
    }
    stopAnim() {
        if (this.anim >= 0) {
            clearTimeout(this.anim);
            this.anim = -1;
        }
    }
    stop() {
        this.stopAnim();
        this.render(null).then(() => {
            this.$play.classed('fa-play', true).classed('fa-pause', false);
        });
    }
    pause() {
        this.stopAnim();
    }
    /**
     * renders the next slide in an animated fashion
     */
    next() {
        const r = this.forward();
        if (r) {
            r.then((act) => {
                this.anim = window.setTimeout(this.next.bind(this), act.duration * StoryTransition.FACTOR);
            });
        }
    }
    /**
     * jumps to the next slide
     * @returns {any}
     */
    forward() {
        this.stopAnim();
        const current = this.graph.selectedSlides()[0];
        const act = current.next;
        if (act == null) {
            this.stop();
            return null;
        }
        return this.render(act);
    }
    /**
     * jumps to the previous slide
     * @returns {any}
     */
    backward() {
        this.stopAnim();
        const current = this.graph.selectedSlides()[0];
        const act = current.previous;
        if (act == null) {
            this.stop();
            return null;
        }
        return this.render(act);
    }
}
//# sourceMappingURL=Player.js.map