import { behavior, mouse as d3mouse, select, selectAll } from 'd3';
import * as d3 from 'd3';
import marked from 'marked';
import * as $ from 'jquery';
import { merge } from 'lodash';
import { Renderer } from '../base/annotation';
import { ModeWrapper } from '../base/mode';
import { ThumbnailUtils } from '../base/ThumbnailUtils';
import { DetailUtils, LevelOfDetail } from './DetailUtils';
import { StoryTransition, Player } from '../base/Player';
import * as textPNG from '../../assets/text.png';
import { Dialog } from '../../components';
import { SlideNode } from '../provenance';
import { AVisInstance } from './visInstance';
import { SelectionUtils, SelectOperation } from '../../idtype';
import { ArrayUtils, BaseUtils } from '../../base';
import { AppContext, DnDUtils } from '../../app';
import { I18nextManager } from '../../i18n';
export class VerticalStoryVis extends AVisInstance {
    constructor(data, parent, options = {}) {
        super();
        this.data = data;
        this.parent = parent;
        this.trigger = this.update.bind(this);
        this.onSelectionChanged = (event, slide, type, op, extras) => {
            this.$node.selectAll('div.story:not(.placeholder)').classed(`phovea-select-${type}`, function (d) {
                const isSelected = d === slide;
                if (isSelected && type === SelectionUtils.defaultSelectionType) {
                    this.scrollIntoView();
                }
                return isSelected;
            });
            if (type === SelectionUtils.defaultSelectionType) {
                this.updateInfo(slide);
                this.updateTimeIndicator(slide, extras.withTransition !== false);
            }
        };
        this.onStateSelectionChanged = (event, state, type, op, extras) => {
            if (!state || extras.slideSelected === true) {
                return;
            }
            const slide = ModeWrapper.getInstance().getMode().exploration < 0.8 ? this.findSlideForState(state) : null;
            const selected = this.data.selectedSlides(type);
            if ((slide && selected.indexOf(slide) >= 0) || (!slide && selected.length === 0)) {
                return;
            }
            if (type === SelectionUtils.defaultSelectionType) {
                this.data.selectSlide(slide, SelectOperation.SET, SelectionUtils.defaultSelectionType, { withTransition: false });
            }
            else {
                this.data.selectSlide(slide, SelectOperation.SET, type);
            }
        };
        this.options = {
            scale: [1, 1],
            rotate: 0,
            class: 'vertical',
            xy: 'y',
            wh: 'height',
            topleft: 'top',
            thumbnails: true,
        };
        this.duration2pixel = d3.scale.linear().domain([0, 10000]).range([VerticalStoryVis.MIN_HEIGHT, 200]);
        this.story = null;
        this.player = null;
        this.options = merge(this.options, options);
        if (this.options.class === 'horizontal') {
            this.options.xy = 'x';
            this.options.wh = 'width';
            this.options.topleft = 'left';
        }
        this.$node = this.build(d3.select(parent));
        AppContext.getInstance().onDOMNodeRemoved(this.node, this.destroy, this);
        this.player = new Player(data, this.node.querySelector('#player_controls'));
        this.bind();
        this.story = this.data.selectedSlides()[0] || this.data.getSlideChains()[0];
        this.update();
    }
    findSlideForState(state) {
        if (!this.story) {
            return null;
        }
        return ArrayUtils.search(SlideNode.toSlidePath(this.story), (s) => s.state === state);
    }
    bind() {
        this.data.on('select_slide', this.onSelectionChanged);
        this.data.on('select_state', this.onStateSelectionChanged);
        this.data.on('start_slide,destroy_slide', this.trigger);
        ModeWrapper.getInstance().on('modeChanged', this.trigger);
    }
    destroy() {
        super.destroy();
        this.data.off('select_slide', this.onSelectionChanged);
        this.data.off('select_state', this.onStateSelectionChanged);
        this.data.off('start_slide,destroy_slide', this.trigger);
        ModeWrapper.getInstance().off('modeChanged', this.trigger);
    }
    get rawSize() {
        return [300, 500];
    }
    get node() {
        return this.$node.node();
    }
    option(name, val) {
        if (arguments.length === 1) {
            return this.options[name];
        }
        this.fire(`option.${name}`, val, this.options[name]);
        this.options[name] = val;
        return undefined;
    }
    transform(scale, rotate = 0) {
        const bak = {
            scale: this.options.scale || [1, 1],
            rotate: this.options.rotate || 0,
        };
        if (arguments.length === 0) {
            return bak;
        }
        const dims = this.data.dim;
        const width = 20;
        const height = dims[0];
        this.$node
            .attr({
            width: width * scale[0],
            height: height * scale[1],
        })
            .style('transform', `rotate(${rotate}deg)`);
        // this.$node.select('g').attr('transform', 'scale(' + scale[0] + ',' + scale[1] + ')');
        const act = { scale, rotate };
        this.fire('transform', act, bak);
        this.options.scale = scale;
        this.options.rotate = rotate;
        return act;
    }
    switchTo(story) {
        if (story) {
            let storyStart = story;
            while (storyStart.previous) {
                storyStart = storyStart.previous;
            }
            this.story = storyStart;
            this.data.selectSlide(story);
        }
        else {
            this.story = null;
        }
        this.update();
    }
    build($parent) {
        let $node = $parent.select('aside.provenance-story-vis');
        if ($node.empty()) {
            $node = $parent.append('aside').classed('provenance-story-vis', true).classed('provenance-sidepanel', true);
        }
        $node
            .attr({
            class: `provenance-story-vis provenance-sidepanel ${this.options.class}`,
        })
            .style('transform', `rotate(${this.options.rotate}deg)`);
        $node.html(`
      <div>
        <h2><i class="fas fa-video"></i> ${I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.story')} <span id="player_controls">
            <i data-player="backward" class="btn btn-sm btn-light fas fa-step-backward" title="${I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.stepBackward')}"></i>
            <i data-player="play" class="btn btn-sm btn-light fas fa-play" title="${I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.play')}"></i>
            <i data-player="forward" class="btn btn-sm btn-light fas fa-step-forward" title="${I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.stepForward')}"></i>
          </span>
          <i class="fas fa-plus-circle"></i></h2>
        <form class="row toolbar" style="display: none" onsubmit="return false;">
          <div class="btn-group col-sm-auto" role="group">
            <button type="button" class="btn btn-light btn-sm dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true"
                    aria-expanded="false">
                    ${I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.select')}<span class="caret"></span>
            </button>
            <div class="dropdown-menu" data-bs-popper="static" id="story_list">
              <!--<a class="dropdown-item" href="#">A</a>-->
            </div>
          </div>
          <div class="btn-group col-sm-auto" role="group">
            <button class="btn btn-light btn-sm" data-create="plus" title="${I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.newStoryLabel')}"><i class="fas fa-plus"></i> ${I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.newStory')}</button>
            <button class="btn btn-light btn-sm" data-create="clone" title="${I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.extractLabel')}"><i class="fas fa-copy"></i> ${I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.extract')}</button>
            <button class="btn btn-light btn-sm" data-create="bookmark" title="${I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.bookmarkedLabel')}"><i class="fas fa-bookmark"></i> ${I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.bookmarked')}</button>
          </div>
        </form>
      </div>
      <div class="current">
        <input type="text" class="form-control" placeholder="${I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.slideName')}" disabled="disabled">
        <div class="name"></div>
        <textarea class="form-control" placeholder="${I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.slideDescription')}" disabled="disabled"></textarea>
        <div class="description"></div>
      </div>
      <div class="stories ${this.options.class}">
        <div class="line"></div>
        <div class="time_marker"><i class="fas fa-circle"></i></div>
      </div>
    `);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        $node.selectAll('button[data-create]').on('click', function () {
            const { create } = this.dataset;
            let story;
            switch (create) {
                case 'plus':
                    story = that.data.startNewSlide(I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.welcome'));
                    break;
                case 'clone': {
                    const state = that.data.selectedStates()[0] || that.data.act;
                    story = that.data.startNewSlide(I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.myStoryTo') +
                        (state ? state.name : I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.heaven')), state ? state.path : []);
                    break;
                }
                case 'bookmark': {
                    const states = that.data.states.filter((d) => d.getAttr('starred', false));
                    story = that.data.startNewSlide(I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.myFavoriteFindings'), states);
                    break;
                }
                default:
                    break;
            }
            that.switchTo(story);
            return false;
        });
        const jp = $($node.node());
        jp.find('.dropdown-toggle').dropdown();
        jp.find('h2 i.fa-plus-circle').on('click', () => {
            jp.find('form.toolbar').toggle('fast');
        });
        {
            const $base = $node.select('div.current');
            $base.select('input').on('change', function () {
                const d = that.data.selectedSlides()[0];
                if (d) {
                    d.name = this.value;
                }
                $base.select('div.name').html(marked(d.name));
                that.update();
            });
            $base.select('textarea').on('change', function () {
                const d = that.data.selectedSlides()[0];
                if (d) {
                    d.description = this.value;
                }
                $base.select('div.description').html(marked(d.description));
                // that.update();
            });
        }
        if (this.data.getSlideChains().length === 0) {
            jp.find('form.toolbar').toggle('fast');
        }
        return $node;
    }
    updateInfo(slide) {
        const $base = this.$node.select('div.current').datum(slide);
        $base
            .select('input')
            .property('value', slide ? slide.name : '')
            .attr('disabled', slide ? null : 'disabled');
        $base.select('div.name').html(slide ? marked(slide.name) : '');
        $base
            .select('textarea')
            .property('value', slide ? slide.description : '')
            .attr('disabled', slide ? null : 'disabled');
        $base.select('div.description').html(slide ? marked(slide.description) : '');
    }
    pushAnnotation(ann) {
        const selected = this.data.selectedSlides()[0];
        if (selected) {
            selected.pushAnnotation(ann);
        }
    }
    onSlideClick(d) {
        this.data.selectSlide(d, SelectOperation.SET, SelectionUtils.defaultSelectionType, { withTransition: false });
        if (d && d.state) {
            this.data.selectState(d.state, SelectOperation.SET, SelectionUtils.defaultSelectionType, { slideSelected: true });
        }
    }
    dndSupport(elem) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        elem
            .on('dragenter', function (d) {
            if (DnDUtils.getInstance().hasDnDType(d3.event, 'application/phovea-prov-state') ||
                DnDUtils.getInstance().hasDnDType(d3.event, 'application/phovea-prov-story') ||
                DnDUtils.getInstance().hasDnDType(d3.event, 'application/phovea-prov-story-text')) {
                d3.select(this).classed('hover', true);
                return false;
            }
            return undefined;
        })
            .on('dragover', (d) => {
            if (DnDUtils.getInstance().hasDnDType(d3.event, 'application/phovea-prov-state') ||
                DnDUtils.getInstance().hasDnDType(d3.event, 'application/phovea-prov-story') ||
                DnDUtils.getInstance().hasDnDType(d3.event, 'application/phovea-prov-story-text')) {
                d3.event.preventDefault();
                DnDUtils.getInstance().updateDropEffect(d3.event);
                return false;
            }
            return undefined;
        })
            .on('dragleave', function (d) {
            d3.select(this).classed('hover', false);
        })
            .on('drop', function (d) {
            d3.select(this).classed('hover', false);
            const e = d3.event;
            e.preventDefault();
            const fullStory = SlideNode.toSlidePath(that.story);
            const dStory = d.isPlaceholder ? d.to : d;
            const insertIntoStory = (newSlide) => {
                if (dStory == null) {
                    // at the beginning
                    const bak = that.story;
                    that.story = newSlide;
                    if (bak) {
                        that.data.insertIntoSlide(newSlide, bak, true);
                    }
                }
                else {
                    that.data.insertIntoSlide(newSlide, dStory, false);
                }
                that.update();
            };
            if (DnDUtils.getInstance().hasDnDType(e, 'application/phovea-prov-state')) {
                const state = that.data.getStateById(parseInt(e.dataTransfer.getData('application/phovea-prov-state'), 10));
                insertIntoStory(that.data.wrapAsSlide(state));
            }
            else if (DnDUtils.getInstance().hasDnDType(e, 'application/application/phovea-prov-story-text')) {
                insertIntoStory(that.data.makeTextSlide());
            }
            else if (DnDUtils.getInstance().hasDnDType(e, 'application/phovea-prov-story')) {
                const story = that.data.getSlideById(parseInt(e.dataTransfer.getData('application/phovea-prov-story'), 10));
                if (fullStory.indexOf(story) >= 0 && e.dataTransfer.dropEffect !== 'copy') {
                    // internal move
                    if (dStory == null) {
                        // no self move
                        if (story !== that.story) {
                            const bak = that.story;
                            that.story = story;
                            that.data.moveSlide(story, bak, true);
                            that.update();
                        }
                    }
                    else {
                        const ref = dStory;
                        if (ref !== story) {
                            // we might moved the first one
                            if (story === that.story) {
                                that.story = story.next;
                            }
                            that.data.moveSlide(story, ref, false);
                            that.update();
                        }
                    }
                }
                else {
                    // multi story move
                    insertIntoStory(that.data.cloneSingleSlideNode(story));
                }
            }
            return false;
        });
    }
    changeDuration($element) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        $element.call(d3.behavior
            .drag()
            .origin(() => ({ x: 0, y: 0 }))
            .on('drag', function (d, i) {
            // update the height of the slide node
            const e = d3.event;
            const $elem = d3.select(this.parentElement);
            const height = Math.max(that.duration2pixel.range()[0], that.duration2pixel(d.duration) + e[that.options.xy]);
            $elem.style(that.options.wh, `${height}px`);
            const change = that.duration2pixel.invert(height) - d.duration;
            const durations = that.$node.selectAll('div.story').filter((a) => !a.isPlaceholder);
            const stories = SlideNode.toSlidePath(that.story);
            durations.select('div.duration span').text((k) => {
                const index = stories.indexOf(k);
                return VerticalStoryVis.to_duration(VerticalStoryVis.to_starting_time(k, stories) + (index > i ? change : 0));
            });
            that.$node
                .select('div.story.placeholder div.duration span')
                .text(VerticalStoryVis.to_duration(VerticalStoryVis.to_starting_time(null, stories) + change));
        })
            .on('dragend', function (d) {
            // update the stored duration just once
            const h = parseInt(d3.select(this.parentElement).style(that.options.wh), 10);
            d.duration = that.duration2pixel.invert(h);
        }));
    }
    changeTransition($element) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        $element.call(d3.behavior
            .drag()
            .origin(() => ({ x: 0, y: 0 }))
            .on('drag', function (d, i) {
            // update the height of the slide node
            const e = d3.event;
            const $elem = d3.select(this.parentElement);
            const offset = Math.max(0, that.duration2pixel(d.transition) - VerticalStoryVis.MIN_HEIGHT + e[that.options.xy]);
            $elem.style(`margin-${that.options.topleft}`, `${offset}px`);
            const change = that.duration2pixel.invert(offset + VerticalStoryVis.MIN_HEIGHT) - d.transition;
            const durations = that.$node.selectAll('div.story').filter((a) => !a.isPlaceholder);
            const stories = SlideNode.toSlidePath(that.story);
            durations.select('div.duration span').text((k) => {
                const index = stories.indexOf(k);
                return VerticalStoryVis.to_duration(VerticalStoryVis.to_starting_time(k, stories) + (index >= i ? change : 0));
            });
            that.$node
                .select('div.story.placeholder div.duration span')
                .text(VerticalStoryVis.to_duration(VerticalStoryVis.to_starting_time(null, stories) + change));
        })
            .on('dragend', function (d) {
            // update the stored duration just once
            const h = parseInt(d3.select(this.parentElement).style(`margin-${that.options.topleft}`), 10);
            d.transition = that.duration2pixel.invert(h + VerticalStoryVis.MIN_HEIGHT);
        }));
    }
    storyInteraction(elem) {
        const graph = this.data;
        elem
            .attr('draggable', true)
            .on('dragstart', (d) => {
            if (!DetailUtils.isEditAble()) {
                d3.event.preventDefault();
                return;
            }
            const e = d3.event;
            e.dataTransfer.effectAllowed = 'copyMove'; // none, copy, copyLink, copyMove, link, linkMove, move, all
            e.dataTransfer.setData('text/plain', d.name);
            e.dataTransfer.setData('application/phovea-prov-story', String(d.id));
        })
            .on('click', this.onSlideClick.bind(this))
            .on('mouseenter', function (d) {
            if (d.state != null) {
                graph.selectState(d.state, SelectOperation.SET, SelectionUtils.hoverSelectionType);
            }
            graph.selectSlide(d, SelectOperation.SET, SelectionUtils.hoverSelectionType);
        })
            .on('mouseleave', function (d) {
            if (d.state != null) {
                graph.selectState(d.state, SelectOperation.REMOVE, SelectionUtils.hoverSelectionType);
            }
            graph.selectSlide(d, SelectOperation.REMOVE, SelectionUtils.hoverSelectionType);
        });
    }
    createToolbar($elem) {
        const $toolbarEnter = $elem.append('div').classed('toolbar', true);
        $toolbarEnter
            .append('i')
            .attr('class', 'fas fa-edit')
            .on('click', (d) => {
            const e = d3.event;
            // remove me
            e.stopPropagation();
            e.preventDefault();
            Dialog.prompt(d.name, {
                title: I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.editName'),
                placeholder: I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.markdownSupported'),
                multiline: true,
            }).then((text) => {
                if (text === null) {
                    return; // dialog was closed without submitting the form
                }
                d.name = text;
                this.update();
                this.updateInfo(d);
            });
            return false;
        });
        $toolbarEnter
            .append('i')
            .attr('class', 'fas fa-copy')
            .attr('title', I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.cloneSlide'))
            .on('click', (d) => {
            const e = d3.event;
            // remove me
            e.stopPropagation();
            e.preventDefault();
            this.data.moveSlide(this.data.cloneSingleSlideNode(d), d, false);
            this.update();
            return false;
        });
        /* $toolbar_enter.append('i').attr('class', 'fas fa-camera').attr('title','force update of preview').on('click', (d) => {
         //remove me
         d3.event.stopPropagation();
         d3.event.preventDefault();
         this.data.moveSlide(this.data.cloneSingleSlideNode(d), d, false);
         this.update();
         return false;
         });
         */
        $toolbarEnter
            .append('i')
            .attr('class', 'fas fa-times')
            .attr('title', I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.removeSlide'))
            .on('click', (d) => {
            const e = d3.event;
            // remove me
            e.stopPropagation();
            e.preventDefault();
            if (d === this.story) {
                this.story = this.story.next;
                if (this.story === null) {
                    this.data.removeFullSlide(d);
                    return;
                }
            }
            this.data.removeSlideNode(d);
            this.update();
        });
    }
    createLastPlaceholder($p) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        $p.html(`<div>
       <button class="btn btn-light btn-sm" data-add="text" title="${I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.addTextSlide')}"><i class="far fa-file-alt"></i></button>
       <button class="btn btn-light btn-sm" data-add="extract" title="${I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.addCurrentState')}"><i class="far fa-file"></i></button>
       <button class="btn btn-light btn-sm" data-add="extract_all" title="${I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.addPathToCurrentState')}"><i class="far fa-copy"></i></button>
       </div>
       <div class="duration"><span>00:00</span><i class="fas fa-circle"></i></div>
      `);
        $p.selectAll('button[data-add]').on('click', function () {
            const create = this.dataset.add;
            const path = SlideNode.toSlidePath(that.story);
            const last = path[path.length - 1];
            switch (create) {
                case 'text':
                    if (last) {
                        that.data.moveSlide(that.data.makeTextSlide(I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.unnamed')), last, false);
                    }
                    else {
                        that.story = that.data.startNewSlide(I18nextManager.getInstance().i18n.t('phovea:clue.storyvis.welcome'));
                    }
                    break;
                case 'extract': {
                    const state = that.data.selectedStates()[0] || that.data.act;
                    const newSlide = that.data.extractSlide([state], false);
                    if (last) {
                        that.data.moveSlide(newSlide, last, false);
                    }
                    else {
                        that.story = newSlide;
                    }
                    break;
                }
                case 'extract_all': {
                    const state2 = that.data.selectedStates()[0] || that.data.act;
                    const newSlide2 = that.data.extractSlide(state2.path, false);
                    if (last) {
                        that.data.moveSlide(newSlide2, last, false);
                    }
                    else {
                        that.story = newSlide2;
                    }
                    break;
                }
                default:
                    break;
            }
            that.update();
        });
    }
    updateSelection() {
        const stories = this.data.getSlideChains();
        const $stories = this.$node.select('.dropdown-menu').selectAll('li').data(stories);
        $stories
            .enter()
            .insert('li')
            .append('a')
            .attr('class', 'dropdown-item')
            .attr('href', '#')
            .on('click', (d) => {
            this.switchTo(d);
            d3.event.preventDefault();
        });
        $stories.select('a').text((d) => d.name);
        $stories.exit().remove();
    }
    update() {
        this.updateSelection();
        const storyRaw = SlideNode.toSlidePath(this.story);
        const story = storyRaw.length > 0 ? [{ id: 'f-1', i: -1, isPlaceholder: true, to: null }] : [];
        storyRaw.forEach((s, i) => {
            story.push(s);
        });
        // duplicate the last placeholder
        story.push({
            id: `l${storyRaw.length - 1}`,
            i: storyRaw.length - 1,
            isPlaceholder: true,
            to: storyRaw[storyRaw.length - 1],
            isLastPlaceholder: true,
        });
        // this.$node.attr('width', (story.length * 70+4)*1.2);
        const toId = (d) => String(d.id);
        const lod = DetailUtils.getLevelOfDetail();
        this.$node
            .classed('large', lod === LevelOfDetail.Large)
            .classed('medium', lod === LevelOfDetail.Medium)
            .classed('small', lod === LevelOfDetail.Small);
        this.$node
            .select('div.stories')
            .classed('large', lod === LevelOfDetail.Large)
            .classed('medium', lod === LevelOfDetail.Medium)
            .classed('small', lod === LevelOfDetail.Small)
            .classed('no-thumbnails', !this.options.thumbnails);
        // var levelShift = [];
        // nodes.forEach((n: any) => levelShift[n.depth] = Math.min(levelShift[n.depth] || 10000, n.x));
        // nodes.forEach((n: any) => n.x -= levelShift[n.depth]);
        const $states = this.$node.select('div.stories').selectAll('div.story').data(story, toId);
        const $statesEnter = $states.enter().append('div').classed('story', true);
        const $storyEnter = $statesEnter.filter((d) => !d.isPlaceholder);
        const $placeholderEnter = $statesEnter.filter((d) => d.isPlaceholder).classed('placeholder', true);
        $storyEnter.call(this.storyInteraction.bind(this));
        $storyEnter.append('div').classed('preview', true);
        $storyEnter.append('div').classed('slabel', true);
        $storyEnter.call(this.createToolbar.bind(this));
        $storyEnter.append('div').classed('duration', true).html('<span></span><i class="fas fa-circle"></i>');
        $storyEnter.append('div').classed('dragger', true).call(this.changeDuration.bind(this)).call(this.dndSupport.bind(this));
        $storyEnter.append('div').classed('dragger-transition', true).call(this.changeTransition.bind(this));
        $placeholderEnter.call(this.dndSupport.bind(this));
        {
            const p = $placeholderEnter.filter((d) => d.isLastPlaceholder);
            p.call(this.createLastPlaceholder.bind(this));
        }
        $states.order();
        const $stories = $states.filter((d) => !d.isPlaceholder);
        $stories.classed('text', (d) => d.isTextOnly);
        $stories.attr('data-id', (d) => d.id);
        $stories.attr('title', (d) => `${d.name}\n${d.transition > 0 ? `(${VerticalStoryVis.to_duration(d.transition)})` : ''}(${VerticalStoryVis.to_duration(d.duration)})`);
        // $stories.attr('data-bs-toggle', 'tooltip');
        $stories
            .select('div.preview')
            .style('background-image', lod < LevelOfDetail.Medium || !this.options.thumbnails
            ? null
            : (d) => (d.isTextOnly ? `url(${textPNG})` : `url(${ThumbnailUtils.thumbnail_url(this.data, d.state)})`));
        $stories.select('div.slabel').html((d) => (d.name ? marked(d.name) : ''));
        $stories.select('div.duration span').text((d, i) => `${VerticalStoryVis.to_duration(VerticalStoryVis.to_starting_time(d, storyRaw))}`);
        $stories.style(this.options.wh, (d) => `${this.duration2pixel(d.duration)}px`);
        $stories.style(`margin-${this.options.topleft}`, (d) => `${this.duration2pixel(d.transition) - VerticalStoryVis.MIN_HEIGHT}px`);
        // const $placeholders = $states.filter((d) => d.isPlaceholder);
        $states
            .filter((d) => d.isLastPlaceholder)
            .select('div.duration span')
            .text(VerticalStoryVis.to_duration(VerticalStoryVis.to_starting_time(null, storyRaw)));
        $states.exit().remove();
    }
    updateTimeIndicator(slide, withTransition) {
        const $marker = this.$node.select('div.time_marker');
        if (!slide) {
            $marker.style('display', 'none');
            return;
        }
        const bounds = BaseUtils.bounds(this.$node.node().querySelector(`div.story[data-id="${slide.id}"]`));
        const base = BaseUtils.bounds(this.$node.node().querySelector('div.stories'));
        // console.log(bounds, base, bounds.y - base.y);
        const t = $marker
            .transition()
            .ease('linear')
            .duration(slide.transition < 0 || !withTransition ? StoryTransition.MIN_TRANSITION : slide.transition * StoryTransition.FACTOR)
            .style('top', `${bounds.y - base.y}px`);
        t.transition()
            .ease('linear')
            .duration(slide.duration < 0 || !withTransition ? StoryTransition.MIN_DURATION : slide.duration * StoryTransition.FACTOR)
            .style('top', `${bounds.y - base.y + bounds.h - 4}px`);
    }
    static createVerticalStoryVis(data, parent, options = {}) {
        return new VerticalStoryVis(data, parent, options);
    }
    static createStoryVis(graph, parent, main, options) {
        const r = Renderer.createAnnotation(main, graph);
        const storyvis = VerticalStoryVis.createVerticalStoryVis(graph, parent, {
            render: r.render,
            thumbnails: options.thumbnails,
        });
        graph.on('select_slide_selected', (event, state) => {
            select('aside.annotations').style('display', state ? null : 'none');
        });
        select('aside.annotations > div:first-of-type').call(behavior.drag().on('drag', function () {
            const mouse = d3mouse(this.parentElement.parentElement);
            select(this.parentElement).style({
                left: `${mouse[0]}px`,
                top: `${mouse[1]}px`,
            });
        }));
        selectAll('aside.annotations button[data-ann]').on('click', function () {
            const create = this.dataset.ann;
            let ann;
            switch (create) {
                case 'text':
                    ann = {
                        type: 'text',
                        pos: [10, 10],
                        text: '',
                    };
                    break;
                case 'arrow':
                    ann = {
                        type: 'arrow',
                        pos: [10, 10],
                        at: [200, 200],
                    };
                    // that.data.appendToStory(that.story.story, that.data.makeTextStory('Unnamed');
                    // this.actStory.addText();
                    break;
                case 'frame':
                    ann = {
                        type: 'frame',
                        pos: [10, 10],
                        size: [20, 20],
                    };
                    break;
                default:
                    break;
            }
            if (storyvis && ann) {
                storyvis.pushAnnotation(ann);
            }
        });
        return storyvis;
    }
    static to_duration(d) {
        const minutesSeconds = d3.time.format('%M:%S');
        return minutesSeconds(new Date(d));
    }
    static to_starting_time(d, story) {
        if (!d) {
            return d3.sum(story, (a) => a.duration + a.transition);
        }
        const i = story.indexOf(d);
        return story.slice(0, i).reduce((a, b) => a + b.duration + b.transition, d.transition);
    }
}
VerticalStoryVis.MIN_HEIGHT = 20;
//# sourceMappingURL=storyvis.js.map