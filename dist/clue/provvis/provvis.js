import * as d3v3 from 'd3v3';
import { merge } from 'lodash';
import { I18nextManager } from 'visyn_core/i18n';
import { SelectOperation, SelectionUtils } from 'visyn_core/idtype';
import { DetailUtils, LevelOfDetail } from './DetailUtils';
import { ThumbnailUtils } from '../base/ThumbnailUtils';
import { ActionMetaData, SlideNode } from '../provenance';
import { AVisInstance } from './visInstance';
import { DnDUtils } from '../../app';
import { onDOMNodeRemoved } from '../../components/RemoveNodeObserver';
import { Dialog } from '../../components/dialogs';
import { ModeWrapper } from '../base/mode';
const DOI_LARGE = 0.9;
const DOI_MEDIUM = 0.7;
const DOI_SMALL = 0.4;
class StateRepr {
    constructor(s, graph) {
        this.s = s;
        this.graph = graph;
        this.xy = [0, 0];
        this.selected = false;
        this.parent = null;
        this.children = [];
        this.a = null;
        this.doi = 0.1;
        this.a = s.creator;
    }
    get thumbnail() {
        return `url(${ThumbnailUtils.thumbnail_url(this.graph, this.s)})`;
    }
    build(lookup, line) {
        const p = this.s.previousState;
        if (p) {
            this.parent = lookup[p.id];
            if (line.indexOf(this) >= 0) {
                // ensure first
                this.parent.children.unshift(this);
            }
            else {
                this.parent.children.push(this);
            }
        }
    }
    get flatChildren() {
        const r = this.children.slice();
        this.children.forEach((c) => r.push.apply(r, c.flatChildren));
        return r;
    }
    get cx() {
        return this.xy[0] + 2;
    }
    get cy() {
        return this.xy[1] + 13;
    }
    get lod_local() {
        if (this.doi >= DOI_LARGE) {
            return LevelOfDetail.Large;
        }
        if (this.doi >= DOI_MEDIUM) {
            return LevelOfDetail.Medium;
        }
        if (this.doi >= DOI_SMALL) {
            return LevelOfDetail.Small;
        }
        return LevelOfDetail.ExtraSmall;
    }
    get lod() {
        const global = DetailUtils.getLevelOfDetail();
        const local = this.lod_local;
        return global < local ? global : local;
    }
    get size() {
        switch (this.lod) {
            case LevelOfDetail.Large:
                return [50, 40];
            case LevelOfDetail.Medium:
                return [30, 18];
            case LevelOfDetail.Small:
                return [30, 18];
            default:
                return [10, 7];
        }
    }
    get name() {
        return this.s.name;
    }
    static toRepr(graph, highlight, options = {}) {
        // assign doi
        const lookup = {};
        // mark selected
        const selected = graph.act;
        const selectedPath = selected.path.reverse();
        const lod = DetailUtils.getLevelOfDetail();
        const size = graph.states.length;
        const toState = (s) => {
            const r = new StateRepr(s, graph);
            const a = s.creator;
            const meta = a ? a.meta : ActionMetaData.actionMeta('No', 'none', 'none');
            const category = highlight.category[meta.category] ? 1 : 0;
            const operation = highlight.operation[meta.operation] ? 1 : 0;
            const bookmark = s.getAttr('starred', false) ? 1 : 0;
            const tags = highlight.tags.length > 0 ? (s.getAttr('tags', []).some((d) => highlight.tags.indexOf(d) >= 0) ? 1 : 0) : 0;
            const isSelected = s === selected ? 3 : 0;
            const inpath = selectedPath.indexOf(s) >= 0 ? Math.max(-2.5, 6 - selectedPath.indexOf(s)) : -2.5;
            const sizePenality = Math.max(-1, -size / 10);
            // combine to a doi value
            const sum = 6 + isSelected + inpath + sizePenality;
            r.doi = d3v3.round(Math.max(0, Math.min(10, sum)) / 10, 1);
            if (category + operation + bookmark + tags > 0) {
                // boost to next level if any of the filters apply
                r.doi = Math.max(r.doi, DOI_SMALL);
            }
            if (!ThumbnailUtils.areThumbnailsAvailable(graph) || options.thumbnails === false) {
                r.doi = Math.min(r.doi, DOI_LARGE - 0.01); // border for switching to thumbnails
            }
            r.selected = s === selected;
            lookup[s.id] = r;
            return r;
        };
        const states = (lod < LevelOfDetail.Medium ? selectedPath : graph.states).map(toState);
        // route to path = 1
        const line = selected.path.map((p) => lookup[p.id]);
        // build tree
        states.forEach((s) => s.build(lookup, line));
        this.layout(states, line);
        // boost all on the right side if they are small to medium
        return states;
    }
    static layout(states, line) {
        // horizontally align the line
        let byLevel = [];
        const root = states.filter((s) => s.parent === null)[0];
        byLevel.push([root]);
        byLevel.push(root.children.slice());
        while (byLevel[byLevel.length - 1].length > 0) {
            byLevel.push([].concat.apply([], byLevel[byLevel.length - 1].map((c) => c.children.slice())));
        }
        byLevel.forEach((level, i) => {
            if (i < line.length) {
                // resort such that the element will be at the first place
                level.splice(level.indexOf(line[i]), 1);
                level.unshift(line[i]);
            }
        });
        let changed = false;
        let loop = 0;
        do {
            changed = false;
            loop++;
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            byLevel.forEach((level, i) => {
                // ensure that my children have at least a >= index than me
                for (let j = 0; j < level.length; ++j) {
                    const s = level[j];
                    if (s) {
                        s.xy = [j, i];
                        if (s.children.length > 0) {
                            const start = byLevel[i + 1].indexOf(s.children[0]);
                            changed = changed || start !== j;
                            if (start < j) {
                                byLevel[i + 1].splice.apply(byLevel[i + 1], [start, 0].concat(d3v3.range(j - start).map((d) => null)));
                            }
                            else if (j < start && j > 0) {
                                level.splice.apply(level, [j, 0].concat(d3v3.range(start - j).map((d) => null)));
                                s.xy[0] = start;
                                j = start;
                            }
                        }
                    }
                }
            });
        } while (changed && loop < 5);
        byLevel = byLevel.filter((d) => d.length > 0);
        // boost all states that are on the left side to medium if they are small
        byLevel.forEach((level) => {
            const s = level[0];
            if (s && s.lod === LevelOfDetail.Small) {
                s.doi = 0.8; // boost to medium
            }
        });
        // we have a bread first with the line at the first position
        // align all columns by their max width
        const colwidths = [];
        const rowheights = [];
        states.forEach((s) => {
            colwidths[s.xy[0]] = Math.max(colwidths[s.xy[0]] || 0, s.size[0]);
            rowheights[s.xy[1]] = Math.max(rowheights[s.xy[1]] || 0, s.size[1]);
        });
        // convert indices to real positions
        const acccolwidths = colwidths.reduce((arr, b, i) => {
            arr[i + 1] = arr[arr.length - 1] + b;
            return arr;
        }, [0]);
        const accrowheights = rowheights.reduce((arr, b, i) => {
            arr[i + 1] = arr[arr.length - 1] + b;
            return arr;
        }, [0]);
        acccolwidths.shift();
        states.forEach((s) => {
            const { xy } = s;
            const x = acccolwidths[acccolwidths.length - 1] - acccolwidths[xy[0]] + 5; // + (colwidths[xy[0]]);
            const y = accrowheights[xy[1]];
            s.xy = [x, y];
        });
    }
    static toIcon(repr) {
        if (!repr.a) {
            return ''; // `<i class="fas fa-circle" title="${repr.s.name}"></i>`;
        }
        const { meta } = repr.a;
        const catIcons = {
            visual: 'chart-bar',
            data: 'database',
            logic: 'cog',
            layout: 'desktop',
            selection: 'pen-square',
        };
        const typeIcons = {
            create: 'plus',
            update: 'sync',
            remove: 'times',
        };
        return `<span title="${meta.name} @ ${meta.timestamp} (${meta.user})"><i class="fas fa-${catIcons[meta.category]}"></i><i class="super fas fa-${typeIcons[meta.operation]}"></i></span>`;
    }
    static render($elem) {
        $elem
            .classed('doi-xs', (d) => d.lod === LevelOfDetail.ExtraSmall)
            .classed('doi-sm', (d) => d.lod === LevelOfDetail.Small)
            .classed('doi', (d) => d.lod === LevelOfDetail.Medium)
            .classed('doi-lg', (d) => d.lod === LevelOfDetail.Large)
            .classed('phovea-select-selected', (d) => d.selected)
            .classed('bookmarked', (d) => d.s.getAttr('starred', false))
            .attr('data-doi', (d) => d.doi)
            .attr('title', (d) => d.name);
        $elem.select('span.icon').html(StateRepr.toIcon);
        $elem.select('span.slabel').text((d) => d.name);
        $elem
            .select('i.bookmark')
            .classed('far', (d) => !d.s.getAttr('starred', false))
            .classed('fas', (d) => d.s.getAttr('starred', false));
        $elem.select('div.sthumbnail').style('background-image', (d) => (d.lod === LevelOfDetail.Large ? d.thumbnail : null));
        $elem.transition().style({
            'padding-left': (d) => `${d.xy[0] + 4}px`,
            top: (d) => `${d.xy[1]}px`,
        });
    }
    showDialog() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const d = this;
        const icon = StateRepr.toIcon(d);
        const title = d.s.name;
        const dia = Dialog.generateDialog(`<span class="icon">${icon}</span> ${title}`);
        const thumbnail = ThumbnailUtils.thumbnail_url(d.graph, d.s, { width: 512, format: 'png' });
        const notes = d.s.getAttr('note', '');
        const starred = d.s.getAttr('starred', false);
        const $body = d3v3.select(dia.body);
        $body.html(`
    <form class="state_info" onsubmit="return false">
      <span class="star ${starred ? 'fas' : 'far'} fa-bookmark" title="${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.bookmarkThisState')}"></span>
      <div class="img"><img src="${thumbnail}"></div>
      <div class="mb-3">
        <label class="form-label">${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.nameCapitalized')}</label>
        <input type="text" class="form-control" placeholder="${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.name')}" value="${title}">
      </div>
      <div class="mb-3">
        <label class="form-label">${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.notesCapitalized')}</label>
        <textarea class="form-control" placeholder="${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.notesPlaceholder')}">${notes}</textarea>
      </div>
      <div class="mb-3">
        <label class="form-label">${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.extractedTags')}</label>
        <input type="text" class="form-control readonly" readonly="readonly" value="${DetailUtils.extractTags(notes).join(' ')}">
      </div>
    </form>`);
        $body.select('span.star').on('click', function () {
            d.s.setAttr('starred', !d.s.getAttr('starred', false));
            $(this).toggleClass('far').toggleClass('fas');
            return false;
        });
        $body.select('textarea').on('input', function () {
            $body.select('input.readonly').property('value', DetailUtils.extractTags(this.value).join(' '));
        });
        dia.footer.querySelector('button.btn-primary').addEventListener('click', function () {
            const name = $body.select('input').property('value');
            d.s.name = name;
            const val = $body.select('textarea').property('value');
            d.s.setAttr('tags', DetailUtils.extractTags(val));
            d.s.setAttr('note', val);
            dia.hide();
        });
        dia.show();
    }
}
export class LayoutedProvVis extends AVisInstance {
    constructor(data, parent, options) {
        super();
        this.data = data;
        this.parent = parent;
        this.options = options;
        this.trigger = this.update.bind(this);
        this.triggerStoryHighlight = this.updateStoryHighlight.bind(this);
        this.onStateAdded = (event, state) => {
            state.on('setAttr', this.trigger);
        };
        this.onSelectionChanged = (event, type, act) => {
            const selectedStates = this.data.selectedStates(type);
            this.$node.selectAll('div.state').classed(`phovea-select-${type}`, function (d) {
                const isSelected = selectedStates.indexOf(d.s) >= 0;
                if (isSelected && type === SelectionUtils.defaultSelectionType) {
                    this.scrollIntoView();
                }
                return isSelected;
            });
        };
        this.line = d3v3.svg
            .line()
            .interpolate('step-after')
            .x((d) => d.cx)
            .y((d) => d.cy);
        this.dim = [200, 100];
        this.highlight = {
            category: {
                data: false,
                visual: false,
                selection: false,
                logic: false,
                layout: false,
                none: false,
            },
            operation: {
                create: false,
                remove: false,
                update: false,
                none: false,
            },
            tags: [],
        };
        this.options = merge({
            thumbnails: true,
            provVisCollapsed: false,
            hideCLUEButtonsOnCollapse: false,
        }, options);
        this.options.scale = [1, 1];
        this.options.rotate = 0;
        this.$node = this.build(d3v3.select(parent));
        onDOMNodeRemoved(this.node, this.destroy, this);
        if (!this.options.provVisCollapsed) {
            this.bind();
            this.update();
        }
    }
    bind() {
        this.data.on('switch_state,forked_branch,clear', this.trigger);
        this.data.on('add_slide,move_slide,remove_slide', this.triggerStoryHighlight);
        this.data.on('add_state', this.onStateAdded);
        this.data.on('select', this.onSelectionChanged);
        this.data.states.forEach((s) => {
            s.on('setAttr', this.trigger);
        });
        ModeWrapper.getInstance().on('modeChanged', this.trigger);
    }
    unbind() {
        this.data.off('switch_state,clear', this.trigger);
        this.data.off('add_slide,move_slidey,remove_slide', this.triggerStoryHighlight);
        this.data.off('add_state', this.onStateAdded);
        this.data.off('select', this.onSelectionChanged);
        this.data.states.forEach((s) => {
            s.off('setAttr', this.trigger);
        });
        ModeWrapper.getInstance().off('modeChanged', this.trigger);
    }
    toggleBinding(enable) {
        if (enable) {
            this.bind();
            this.update();
        }
        else {
            this.unbind();
        }
    }
    destroy() {
        super.destroy();
        this.unbind();
    }
    get rawSize() {
        return this.dim;
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
    build($parent) {
        //  scale = this.options.scale;
        let $p = $parent.select('aside.provenance-layout-vis');
        if ($p.empty()) {
            $p = $parent.append('aside').classed('provenance-layout-vis', true);
        }
        $p.classed('collapsed', this.options.provVisCollapsed).style('transform', `rotate(${this.options.rotate}deg)`);
        if (this.options.hideCLUEButtonsOnCollapse && this.options.provVisCollapsed) {
            d3v3.select('header.clue-modeselector').classed('collapsed', true);
        }
        $p.html(`
      <a href="#" class="btn-collapse" data-testid="show-provenance-button" title="${this.options.provVisCollapsed
            ? I18nextManager.getInstance().i18n.t('phovea:clue.provvis.showProvenanceGraph')
            : I18nextManager.getInstance().i18n.t('phovea:clue.provvis.hideProvenanceGraph')}"><i class="far ${this.options.provVisCollapsed ? 'fa-arrow-alt-circle-left' : 'fa-arrow-alt-circle-right'}"></i></a>
      <div>
        <h2>
          <i class="fas fa-code-branch fa-rotate-180"></i> ${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.provenance')}
          <a href="#" class="btn-filter"><i class="fas fa-filter"></i></a>
        </h2>
        <div class="btn-toolbar toolbar p-1" style="display:none">
        <div class="btn-group" role="group">
          <input type="checkbox" class="btn-check" autocomplete="off" id="btncheck_data" name="category" value="data" >
          <label class="btn btn-outline-secondary btn-sm" for="btncheck_data" title="${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.dataActions')}">
            <i class="fas fa-database"></i>
          </label>
          <input type="checkbox" class="btn-check" autocomplete="off" id="btncheck_visual" name="category" value="visual">
          <label class="btn btn-outline-secondary btn-sm" for="btncheck_visual" title="${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.visualActions')}">
            <i class="fas fa-chart-bar"></i>
          </label>
          <input type="checkbox" class="btn-check" autocomplete="off" id="btncheck_selection" name="category" value="selection">
          <label class="btn btn-outline-secondary btn-sm" for="btncheck_selection" title="${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.selectionActions')}">
            <i class="fas fa-pen-square"></i>
          </label>
          <input type="checkbox" class="btn-check" autocomplete="off" id="btncheck_layout" name="category" value="layout">
          <label class="btn btn-outline-secondary btn-sm" for="btncheck_layout" title="${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.layoutActions')}">
            <i class="fas fa-desktop"></i>
          </label>
          <input type="checkbox" class="btn-check" autocomplete="off" id="btncheck_logic" name="category" value="logic">
          <label class="btn btn-outline-secondary btn-sm" for="btncheck_logic" title="${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.logicActions')}">
            <i class="fas fa-cog"></i>
          </label>
        </div>

        <div class="btn-group" role="group">
          <input type="checkbox" class="btn-check" autocomplete="off" id="btncheck_create" name="operation" value="create">
          <label class="btn btn-outline-secondary btn-sm" for="btncheck_create" title="${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.createActions')}">
             <i class="fas fa-plus"></i>
          </label>
          <input type="checkbox" class="btn-check" autocomplete="off" id="btncheck_update" name="operation" value="update">
          <label class="btn btn-outline-secondary btn-sm" for="btncheck_update" title="${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.updateActions')}">
             <i class="fas fa-sync"></i>
          </label>
          <input type="checkbox" class="btn-check" autocomplete="off" id="btncheck_remove" name="operation" value="remove">
          <label class="btn btn-outline-secondary btn-sm" for="btncheck_update" title="${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.removeActions')}">
             <i class="fas fa-times"></i>
          </label>
        </div>

            <div class="dropdown">
              <button class="btn btn-outline-secondary dropdown-toggle btn-sm" type="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <i class="fas fa-tags"></i>
              </button>
              <div class="dropdown-menu dropdown-menu-end" data-bs-popper="static" aria-labelledby="dropdownMenuButton">
                <form class="px-1" onsubmit="return false;">
                  <div class="input-group input-group-sm">
                        <span class="input-group-text" id="provenance-filter-tags" title="${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.taggedStates')}"><i class="fas fa-tags"></i></span>
                        <input name="tags" type="text" class="form-control form-control-sm" placeholder="${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.tags')}" aria-describedby="provenance-filter-tags">
                  </div>
                </form>
              </div>
            </div>

        </div>
      </div>
      <div style="position: relative">
        <svg>
          <g transform="translate(1,1)" class="edges"></g>
          <g transform="translate(1,1)" class="storyhighlights" style="display:none">
            <path class="story"></path>
          </g>
        </svg>
        <div class="states"></div>
      </div>
      <div class="legend">
      <div class="btn-group-vertical" role="group">
      <input type="checkbox" class="btn-check" autocomplete="off" id="btncheck_vertical_1" name="category" value="data">
        <label class="btn btn-outline-secondary btn-sm mb-0" for="btncheck_vertical_1" title="${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.dataActions')}">
          <i class="fas fa-database"></i> ${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.data')}
        </label>
        <input type="checkbox" class="btn-check" autocomplete="off" id="btncheck_vertical_2" name="category" value="visual" >
        <label class="btn btn-outline-secondary btn-sm mb-0" for="btncheck_vertical_2" title="${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.visualActions')}">
          <i class="fas fa-chart-bar"></i> ${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.visual')}
        </label>
        <input type="checkbox" class="btn-check" autocomplete="off" id="btncheck_vertical_3" name="category" value="selection" >
        <label class="btn btn-outline-secondary btn-sm mb-0" for="btncheck_vertical_3" title="${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.selectionActions')}">
           <i class="fas fa-pen-square"></i> ${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.selections')}
        </label>
        <input type="checkbox" class="btn-check" autocomplete="off" id="btncheck_vertical_4" name="category" value="layout">
        <label class="btn btn-outline-secondary btn-sm mb-0" for="btncheck_vertical_4" title="${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.layoutActions')}">
           <i class="fas fa-desktop"></i> ${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.layout')}
        </label>
        <input type="checkbox" class="btn-check" autocomplete="off" id="btncheck_vertical_5" name="category" value="logic">
        <label class="btn btn-outline-secondary btn-sm mb-0" for="btncheck_vertical_5" title="${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.logicActions')}">
           <i class="fas fa-cog"></i> ${I18nextManager.getInstance().i18n.t('phovea:clue.provvis.analysis')}
        </label>
        </div>
      </div>
    `);
        // init the toolbar filter options
        const jp = $($p.node());
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        // must use bootstrap since they are manually triggered
        jp.find('div.toolbar input, .legend input').on('change', function () {
            const inputElement = this;
            if (inputElement.type === 'text') {
                that.highlight.tags = inputElement.value.split(' ');
                jp.find('button[data-bs-toggle="dropdown"]').toggleClass('active', that.highlight.tags.length > 0);
            }
            else {
                that.highlight[inputElement.name][inputElement.value] = inputElement.checked;
            }
            that.update();
        });
        // initialize bootstrap
        import('jquery').then((jquery) => {
            // avoid Property 'button' does not exist on type 'JQuery<HTMLElement>'
            // @ts-ignore
            $($p.node()).find('*[data-bs-toggle="buttons"],.btn[data-bs-toggle="button"]').button();
        });
        jp.find('.btn-filter').on('click', () => {
            jp.find('div.toolbar').toggle('fast');
            return false;
        });
        jp.find('.btn-collapse').on('click', (evt) => {
            evt.preventDefault();
            const collapsed = !$p.classed('collapsed');
            this.toggleBinding(!collapsed);
            $p.select('.btn-collapse').attr('title', collapsed
                ? I18nextManager.getInstance().i18n.t('phovea:clue.provvis.showProvenanceGraph')
                : I18nextManager.getInstance().i18n.t('phovea:clue.provvis.hideProvenanceGraph'));
            $p.select('.btn-collapse > i').classed('fa-arrow-alt-circle-right', !collapsed).classed('fa-arrow-alt-circle-left', collapsed);
            $p.classed('collapsed', collapsed);
            if (this.options.hideCLUEButtonsOnCollapse) {
                d3v3.select('header.clue-modeselector').classed('collapsed', collapsed);
            }
        });
        return $p;
    }
    onStateClick(d) {
        d3v3.event.stopPropagation();
        this.data.selectState(d.s, SelectionUtils.toSelectOperation(d3v3.event));
        this.data.jumpTo(d.s);
    }
    update() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        const graph = this.data;
        const lod = DetailUtils.getLevelOfDetail();
        this.$node.classed('large', lod === LevelOfDetail.Large);
        this.$node.classed('medium', lod === LevelOfDetail.Medium);
        this.$node.classed('small', lod === LevelOfDetail.Small);
        this.$node.classed('xsmall', lod === LevelOfDetail.ExtraSmall);
        const states = StateRepr.toRepr(graph, this.highlight, { thumbnails: this.options.thumbnails });
        const $states = this.$node
            .select('div.states')
            .selectAll('div.state')
            .data(states, (d) => `${d.s.id}`);
        const $statesEnter = $states
            .enter()
            .append('div')
            .classed('state', true)
            .attr('data-id', (d) => d.s.id)
            .append('div')
            .on('click', this.onStateClick.bind(this))
            .on('mouseenter', (d) => {
            graph.selectState(d.s, SelectOperation.SET, SelectionUtils.hoverSelectionType);
        })
            .on('mouseleave', (d) => {
            graph.selectState(d.s, SelectOperation.REMOVE, SelectionUtils.hoverSelectionType);
        })
            .attr('draggable', true)
            .on('dragstart', (d) => {
            const e = d3v3.event;
            e.dataTransfer.effectAllowed = 'copy'; // none, copy, copyLink, copyMove, link, linkMove, move, all
            e.dataTransfer.setData('text/plain', d.s.name);
            e.dataTransfer.setData('application/phovea-prov-state', String(d.s.id));
        })
            .on('dragenter', function () {
            if (DnDUtils.getInstance().hasDnDType(d3v3.event, 'application/phovea-prov-state')) {
                d3v3.select(this).classed('hover', true);
                return false;
            }
            return undefined;
        })
            .on('dragover', () => {
            if (DnDUtils.getInstance().hasDnDType(d3v3.event, 'application/phovea-prov-state')) {
                d3v3.event.preventDefault();
                DnDUtils.getInstance().updateDropEffect(d3v3.event);
                return false;
            }
            return undefined;
        })
            .on('dragleave', function () {
            d3v3.select(this).classed('hover', false);
        })
            .on('drop', function (d) {
            d3v3.select(this).classed('hover', false);
            const e = d3v3.event;
            e.preventDefault();
            const state = that.data.getStateById(parseInt(e.dataTransfer.getData('application/phovea-prov-state'), 10));
            that.data.fork(state.creator, d.s);
            return false;
        });
        const $inner = $statesEnter;
        $inner.append('i').attr('class', 'fas fa-circle glyph');
        $inner.append('span').classed('icon', true);
        /* $states_enter.append('span').attr('class','fas fa-star').on('click', (d) => {
          d.s.setAttr('starred',!d.s.getAttr('starred',false));
          d3v3.event.stopPropagation();
          d3v3.event.preventDefault();
        });
        $states_enter.append('span').attr('class','fas fa-tags').on('click', (d) => {
          var tags = d.s.getAttr('tags',[]).join(' ');
          dialogs.prompt(tags, 'Tags').then((new_) => {
            d.s.setAttr('tags', new_.split(' '));
          });
          d3v3.event.stopPropagation();
          d3v3.event.preventDefault();
        }); */
        $inner.append('span').classed('slabel', true);
        $inner.append('div').classed('sthumbnail', true);
        const $toolbarEnter = $statesEnter.append('div').classed('toolbar', true);
        $toolbarEnter
            .append('i')
            .attr('class', 'bookmark far fa-bookmark')
            .on('click', function (d) {
            const v = !d.s.getAttr('starred', false);
            const e = d3v3.event;
            d.s.setAttr('starred', v);
            d3v3.select(this).classed('fas', v).classed('far', !v);
            e.stopPropagation();
            e.preventDefault();
        });
        $toolbarEnter
            .append('i')
            .attr('class', 'fas fa-edit')
            .on('click', (d) => {
            const e = d3v3.event;
            d.showDialog();
            e.stopPropagation();
            e.preventDefault();
        });
        $states.call(StateRepr.render);
        $states.exit().remove();
        // just for the entered ones
        // (<any>$($states_enter[0][0]).find<HTMLElement>('> span.icon')).popover(StateRepr.popover)
        //  .parent().on({
        //    mouseenter: function () {
        //      var $icon = $(this).find<HTMLElement>('> span.icon');
        //      $icon.addClass('popping');
        //      $icon.data('popup', setTimeout(function () {
        //        (<any>$icon).popover('show');
        //      }, 200));
        //    },
        //    mouseleave: function () {
        //      var $icon = $(this).find<HTMLElement>('> span.icon');
        //      const id = +$icon.data('popoup');
        //      clearTimeout(id);
        //      $icon.removeData('popup');
        //      const d:StateRepr = d3v3.select(this).datum();
        //      if (d && $icon.has('textarea')) {
        //        const val = $(this).find<HTMLElement>('textarea').val();
        //        d.s.setAttr('tags', extractTags(val));
        //        d.s.setAttr('note', val);
        //      }
        //      (<any>$icon).popover('hide');
        //    }
        //  });
        const edges = [];
        states.forEach((s) => {
            edges.push.apply(edges, s.children.map((c) => ({ s, t: c })));
        });
        this.dim = [
            d3v3.max(states, (s) => s.xy[0] + s.size[0]) + (lod >= LevelOfDetail.Medium ? 200 : 0), // for label
            d3v3.max(states, (s) => s.xy[1] + s.size[1]),
        ];
        this.$node.select('svg').attr('width', this.dim[0]).attr('height', this.dim[1]);
        const $edges = this.$node
            .select('svg g.edges')
            .selectAll('path')
            .data(edges, (d) => `${d.s.s.id}-${d.t.s.id}`);
        $edges.enter().append('path');
        $edges.transition().attr('d', (d) => this.line([d.s, d.t]));
        $edges.exit().remove();
        this.updateStoryHighlight();
    }
    updateStoryHighlight() {
        // TODO hide if not needed
        const $g = this.$node.select('svg g.storyhighlights');
        const $states = this.$node.select('div.states').selectAll('div.state');
        const states = $states.data();
        const lookup = {};
        states.forEach((s) => (lookup[s.s.id] = s));
        let firstSlide = this.data.selectedSlides()[0] || this.data.getSlideChains()[0];
        if (firstSlide) {
            $g.style('display', null);
            while (firstSlide.previous) {
                firstSlide = firstSlide.previous;
            }
            const line = SlideNode.toSlidePath(firstSlide)
                .map((s) => (s.state ? lookup[s.state.id] : null))
                .filter((d) => !!d);
            $states.classed('story_member', (d) => line.indexOf(d) >= 0);
            $g.select('path').attr('d', this.line.interpolate('linear')(line));
            this.line.interpolate('step-after');
        }
        else {
            $g.style('display', 'none');
        }
    }
    static createLayoutedProvVis(data, parent, options = {}) {
        return new LayoutedProvVis(data, parent, options);
    }
}
//# sourceMappingURL=provvis.js.map