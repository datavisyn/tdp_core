/**
 * Created by Samuel Gratzl on 29.01.2016.
 */

import 'scrollTo';
import {ProvenanceGraph, IObjectRef, action, meta, op, cat, ActionNode, ref, ICmdFunction} from 'phovea_core/src/provenance';
import {IDType, resolve, defaultSelectionType} from 'phovea_core/src/idtype';
import {Range, none, parse} from 'phovea_core/src/range';
import * as d3 from 'd3';
import * as $ from 'jquery';
import {TargidConstants} from './Targid';
import {EventHandler, IEventHandler} from 'phovea_core/src/event';
import {IPluginDesc, IPlugin, list as listPlugins} from 'phovea_core/src/plugin';
import {INamedSet} from './storage';


export enum EViewMode {
  FOCUS, CONTEXT, HIDDEN
}

export interface IViewPluginDesc extends IPluginDesc {
  selection: string; //none (0), single (1), multiple (>=1),
  idtype?: string;
  mockup?: boolean;
}

function toViewPluginDesc(p : IPluginDesc): IViewPluginDesc {
  const r : any = p;
  r.selection = r.selection || 'none';
  return r;
}

export function matchLength(s: any, length: number) {
  switch(String(s)) {
    case '':
    case 'none':
    case '0':
      return length === 0;
    case 'any':
      return true;
    case 'single':
    case '1':
    case 'small_multiple':
      return length === 1;
    case 'multiple':
    case 'some':
      return length >= 1;
    case '2':
      return length === 2;
    default:
      return false;
  }
}

function showAsSmallMultiple(desc: any) {
  return desc.selection === 'small_multiple';
}

const CHOOSER_CATEGORY_WEIGHTS = new Map([
  ['Sample overview', 100],
  ['Gene overview', 100],
  ['Visualization', 90],
  ['Internal resources', 80],
  ['External resources', 70],
  ['Other', 0]
]);


/**
 * Find views for a given idtype and number of selected items.
 * The seleted items itself are not considered in this function.
 * @param idtype
 * @param selection
 * @returns {any}
 */
export async function findViews(idtype:IDType, selection:Range) : Promise<{enabled: boolean, v: IViewPluginDesc}[]> {
  if (idtype === null) {
    return Promise.resolve([]);
  }
  const selectionLength = idtype === null || selection.isNone ? 0 : selection.dim(0).length;
  const mappedTypes = await idtype.getCanBeMappedTo();
  const all = [idtype].concat(mappedTypes);
  function byType(p: any) {
    const pattern = p.idtype ? new RegExp(p.idtype) : /.*/;
    return all.some((i) => pattern.test(i.id)) && !matchLength(p.selection, 0);
  }
  function bySelection(p: any) {
    return (matchLength(p.selection, selectionLength) || (showAsSmallMultiple(p) && selectionLength > 1));
  }
  return listPlugins(TargidConstants.VIEW)
    .filter(byType)
    .sort((a,b) => d3.ascending(a.name.toLowerCase(), b.name.toLowerCase()))
    .map((v) => ({enabled: bySelection(v), v: toViewPluginDesc(v)}));
}

export interface ISelection {
  idtype: IDType;
  range: Range;
}

export interface IViewContext {
  readonly graph: ProvenanceGraph;
  readonly desc: IViewPluginDesc;
  readonly ref: IObjectRef<any>;
}

export interface IView extends IEventHandler {
  //constructor(context: IViewContext, selection: ISelection, parent: Element, options?);

  node: Element;
  context:IViewContext;

  init(): void;

  changeSelection(selection: ISelection): void;

  setItemSelection(selection: ISelection): void;

  getItemSelection(): ISelection;

  buildParameterUI($parent: d3.Selection<any>, onChange: (name: string, value: any)=>Promise<any>): void;

  getParameter(name: string): any;

  setParameter(name: string, value: any);

  modeChanged(mode:EViewMode);

  destroy(): void;
}

export abstract class AView extends EventHandler implements IView {
  /**
   * event when one or more elements are selected for the next level
   * @type {string}
   * @argument selection {ISelection}
   */
  static EVENT_ITEM_SELECT = 'select';

  static EVENT_UPDATE_ENTRY_POINT = 'update_entry_point';
  /**
   * event is fired when the loading of the iframe has finished
   * @type {string}
   * @argument selection {ISelection}
   */
  static EVENT_LOADING_FINISHED = 'loadingFinished';

  protected $node:d3.Selection<IView>;
  private itemSelection: ISelection = { idtype: null, range: none() };

  constructor(public readonly context:IViewContext, parent:Element, options?: {}) {
    super();
    this.$node = d3.select(parent).append('div').datum(this);
    this.$node.append('div').classed('busy', true).classed('hidden', true);
  }

  protected setBusy(busy: boolean) {
    this.$node.select('div.busy').classed('hidden', !busy);
  }

  init() {
    // hook
  }

  changeSelection(selection: ISelection) {
    // hook
  }

  setItemSelection(selection: ISelection) {
    if (isSameSelection(this.itemSelection, selection)) {
      return;
    }
    // propagate
    if (selection.idtype) {
      if (selection.range.isNone) {
        selection.idtype.clear(defaultSelectionType);
      } else {
        selection.idtype.select(selection.range);
      }
    }
    this.fire(AView.EVENT_ITEM_SELECT, this.itemSelection, this.itemSelection = selection);
  }

  getItemSelection() {
    return this.itemSelection;
  }

  buildParameterUI($parent: d3.Selection<any>, onChange: (name: string, value: any)=>Promise<any>) {
    // hook
  }

  getParameter(name: string): any {
    return null;
  }

  setParameter(name: string, value: any) {
    // hook
    return null;
  }

  modeChanged(mode:EViewMode) {
    // hook
  }

  protected resolveIdToNames(fromIDType: IDType, id: number, toIDType : IDType|string = null): Promise<string[][]> {
    const target = toIDType === null ? fromIDType: resolve(toIDType);
    if (fromIDType.id === target.id) {
      // same just unmap to name
      return fromIDType.unmap([id]).then((names) => [names]);
    }

    // assume mappable
    return fromIDType.mapToName([id], target).then((names) => names);
  }

  protected resolveId(fromIDType: IDType, id: number, toIDtype : IDType|string = null): Promise<string> {
    const target = toIDtype === null ? fromIDType: resolve(toIDtype);
    if (fromIDType.id === target.id) {
      // same just unmap to name
      return fromIDType.unmap([id]).then((names) => names[0]);
    }

    // assume mappable
    return fromIDType.mapToFirstName([id], target).then((names) => names[0]);
  }

  protected resolveIds(fromIDType: IDType, ids: Range|number[], toIDType : IDType|string = null): Promise<string[]> {
    const target = toIDType === null ? fromIDType: resolve(toIDType);
    if (fromIDType.id === target.id) {
      // same just unmap to name
      return fromIDType.unmap(ids);
    }
    // assume mappable
    return fromIDType.mapToFirstName(ids, target);
  }

  destroy() {
    this.$node.remove();
  }

  get node() {
    return <Element>this.$node.node();
  }
}

export abstract class ASmallMultipleView extends AView {

  protected margin = {top: 40, right: 5, bottom: 50, left: 50};
  protected width = 280 - this.margin.left - this.margin.right;
  protected height = 320 - this.margin.top - this.margin.bottom;

  constructor(context:IViewContext, selection: ISelection, parent:Element, plugin: IPluginDesc, options?: {}) {
    super(context, parent, options);
  }

  init() {
    super.init();
    this.$node.classed('multiple', true);
  }
}


export async function setParameterImpl(inputs:IObjectRef<any>[], parameter, graph:ProvenanceGraph) {
  const view: ViewWrapper = await inputs[0].v;
  const name = parameter.name;
  const value = parameter.value;

  const bak = view.getParameter(name);
  view.setParameterImpl(name, value);
  return {
    inverse: setParameter(inputs[0], name, bak)
  };
}
export function setParameter(view:IObjectRef<ViewWrapper>, name: string, value: any) {
  //assert view
  return action(meta('Set Parameter "'+name+'"', cat.visual, op.update), TargidConstants.CMD_SET_PARAMETER, setParameterImpl, [view], {
    name,
    value
  });
}

export async function setSelectionImpl(inputs:IObjectRef<any>[], parameter) {
  const views:ViewWrapper[] = await Promise.all([inputs[0].v, inputs.length > 1 ? inputs[1].v : null]);
  const view = views[0];
  const target = views[1];
  const idtype = parameter.idtype ? resolve(parameter.idtype) : null;
  const range = parse(parameter.range);

  const bak = view.getItemSelection();
  view.setItemSelection({ idtype, range});
  if (target) {
    target.setParameterSelection({ idtype, range});
  }
  return {
    inverse: inputs.length > 1 ? setAndUpdateSelection(inputs[0], inputs[1], bak.idtype, bak.range): setSelection(inputs[0], bak.idtype, bak.range)
  };
}
export function setSelection(view:IObjectRef<ViewWrapper>, idtype: IDType, range: Range) {
  // assert view
  return action(meta('Select '+(idtype ? idtype.name : 'None'), cat.selection, op.update), TargidConstants.CMD_SET_SELECTION, setSelectionImpl, [view], {
    idtype: idtype ? idtype.id : null,
    range: range.toString()
  });
}

export function setAndUpdateSelection(view:IObjectRef<ViewWrapper>, target:IObjectRef<ViewWrapper>, idtype: IDType, range: Range) {
  // assert view
  return action(meta('Select '+(idtype ? idtype.name : 'None'), cat.selection, op.update), TargidConstants.CMD_SET_SELECTION, setSelectionImpl, [view, target], {
    idtype: idtype ? idtype.id : null,
    range: range.toString()
  });
}

export function createCmd(id):ICmdFunction {
  switch (id) {
    case TargidConstants.CMD_SET_PARAMETER:
      return setParameterImpl;
    case TargidConstants.CMD_SET_SELECTION:
      return setSelectionImpl;
  }
  return null;
}

function isSameSelection(a: ISelection, b: ISelection) {
  const aNull = (a === null || a.idtype === null);
  const bNull = (b === null || b.idtype === null);
  if (aNull || bNull) {
    return aNull === bNull;
  }
  return a.idtype.id === b.idtype.id && a.range.eq(b.range);
}

/**
 * compresses the given path by removing redundant focus operations
 * @param path
 * @returns {ActionNode[]}
 */
export function compressSetParameter(path:ActionNode[]) {
  const possible = path.filter((p) => p.f_id === TargidConstants.CMD_SET_PARAMETER);
  //group by view and parameter
  const toKey = (p: ActionNode) => p.requires[0].id+'_'+p.parameter.name;
  const last = d3.nest().key(toKey).map(possible);
  return path.filter((p) => {
    if (p.f_id !== TargidConstants.CMD_SET_PARAMETER) {
      return true;
    }
    const elems = last[toKey(p)];
    return elems[elems.length-1] === p; //just the last survives
  });
}

export function compressSetSelection(path:ActionNode[]) {
  const lastByIDType : any = {};
  path.forEach((p) => {
    if (p.f_id === TargidConstants.CMD_SET_SELECTION) {
      const para = p.parameter;
      lastByIDType[para.idtype+'@'+p.requires[0].id] = p;
    }
  });
  return path.filter((p) => {
    if (p.f_id !== TargidConstants.CMD_SET_SELECTION) {
      return true;
    }
    const para = p.parameter;
    //last one remains
    return lastByIDType[para.idtype+'@'+p.requires[0].id] === p;
  });
}

function generate_hash(desc: IPluginDesc, selection: ISelection) {
  const s = (selection.idtype ? selection.idtype.id : '')+'r' + (selection.range.toString());
  return desc.id+'_'+s;
}

export class ViewWrapper extends EventHandler {
  static EVENT_CHOOSE_NEXT_VIEW = 'open';
  static EVENT_FOCUS = 'focus';
  static EVENT_REMOVE = 'remove';

  private $viewWrapper:d3.Selection<ViewWrapper>;
  private $node:d3.Selection<ViewWrapper>;
  private $chooser:d3.Selection<ViewWrapper>;

  private _mode:EViewMode = null;

  private instance:IView = null;

  /**
   * Listens to the AView.EVENT_ITEM_SELECT event and decided if the chooser should be visible.
   * Then dispatches the incoming event again (aka bubbles up).
   * @param event
   * @param oldSelection
   * @param newSelection
   */
  private listenerItemSelect = (event: any, oldSelection: ISelection, newSelection: ISelection) => {
    this.chooseNextViews(newSelection.idtype, newSelection.range);
    this.fire(AView.EVENT_ITEM_SELECT, oldSelection, newSelection);
  }

  /**
   * Forward event from view to Targid instance
   * @param event
   * @param idtype
   * @param namedSet
   */
  private listenerUpdateEntryPoint = (event: any, idtype: IDType | string, namedSet: INamedSet) => {
    this.fire(AView.EVENT_UPDATE_ENTRY_POINT, idtype, namedSet);
  }

  /**
   * Wrapper function for event listener
   */
  private scrollIntoViewListener = () => {
    this.scrollIntoView();
  }

  /**
   * Provenance graph reference of this object
   */
  ref: IObjectRef<ViewWrapper>;

  /**
   * Provenance graph context
   */
  context: IViewContext;

  /**
   * Initialize this view, create the root node and the (inner) view
   * @param graph
   * @param selection
   * @param parent
   * @param plugin
   * @param options
   */
  constructor(private readonly graph: ProvenanceGraph, public selection: ISelection, parent:Element, private plugin:IPlugin, public options?) {
    super();

    this.init(graph, selection, plugin, options);

    // create ViewWrapper root node
    this.$viewWrapper = d3.select(parent).append('div').classed('viewWrapper', true);

    this.createView(selection, plugin, options);
  }

  /**
   * Create provenance reference object (`this.ref`) and the context (`this.context`)
   * @param graph
   * @param selection
   * @param plugin
   * @param options
   */
  private init(graph: ProvenanceGraph, selection: ISelection, plugin:IPlugin, options?) {
    // create provenance reference
    this.ref = ref(this, plugin.desc.name, cat.visual, generate_hash(plugin.desc, selection));

    //console.log(graph, generate_hash(plugin.desc, selection, options));

    // create (inner) view context
    this.context = createContext(graph, plugin.desc, this.ref);
  }

  /**
   * Create the corresponding DOM elements + chooser and the new (inner) view from the given parameters
   * @param selection
   * @param plugin
   * @param options
   */
  private createView(selection: ISelection, plugin:IPlugin, options?) {
    this.$node = this.$viewWrapper.append('div')
      .classed('view', true)
      .datum(this);

    this.$chooser = this.$viewWrapper.append('div')
      .classed('chooser', true)
      .classed('hidden', true) // closed by default --> opened on selection (@see this.chooseNextViews())
      .datum(this);

    const $params = this.$node.append('div')
      .attr('class', 'parameters form-inline')
      .datum(this);

    $params.append('button')
      .attr('class', 'btn btn-default btn-sm btn-close')
      .html('<i class="fa fa-close"></i>')
      .on('click', (d) => {
        this.remove();
      });

    const $inner = this.$node.append('div')
      .classed('inner', true);

    this.instance = plugin.factory(this.context, selection, <Element>$inner.node(), options, plugin.desc);
    this.instance.buildParameterUI($params, this.onParameterChange.bind(this));
    this.instance.init();

    this.instance.on(AView.EVENT_ITEM_SELECT, this.listenerItemSelect);
    this.instance.on(AView.EVENT_UPDATE_ENTRY_POINT, this.listenerUpdateEntryPoint);

    this.instance.on(AView.EVENT_LOADING_FINISHED, this.scrollIntoViewListener);
  }

  /**
   * Replace the inner view with a new view, created from the given parameters.
   * Note: Destroys all references and DOM elements of the old view, except the root node of this ViewWrapper
   * @param selection
   * @param plugin
   * @param options
   */
  public replaceView(selection: ISelection, plugin:IPlugin, options?) {
    this.destroyView();

    this.selection = selection;
    this.plugin = plugin;
    this.options = options;

    this.init(this.graph, selection, plugin, options);
    this.createView(selection, plugin, options);
  }

  /**
   * De-attache the event listener to (inner) view, destroys instance and removes the DOM elements
   */
  private destroyView() {
    // un/register listener only for ProxyViews
    this.instance.off(AView.EVENT_LOADING_FINISHED, this.scrollIntoViewListener);
    this.instance.off(AView.EVENT_ITEM_SELECT, this.listenerItemSelect);
    this.instance.off(AView.EVENT_UPDATE_ENTRY_POINT, this.listenerUpdateEntryPoint);
    this.instance.destroy();

    this.$viewWrapper.select('.view').remove();
    this.$chooser.remove();
  }

  /**
   * Destroys the inner view and the ViewWrapper's root node
   */
  destroy() {
    this.destroyView();
    this.$viewWrapper.remove();
  }

  getInstance() {
    return this.instance;
  }


  private onParameterChange(name: string, value: any) {
    return this.context.graph.push(setParameter(this.ref, name, value));
  }

  getParameter(name: string) {
    return this.instance.getParameter(name);
  }

  setParameterImpl(name: string, value: any) {
    return this.instance.setParameter(name, value);
  }

  getItemSelection() {
    return this.instance.getItemSelection();
  }

  setItemSelection(sel: ISelection) {
    // turn listener off, to prevent an infinite event loop
    this.instance.off(AView.EVENT_ITEM_SELECT, this.listenerItemSelect);

    this.instance.setItemSelection(sel);

    this.chooseNextViews(sel.idtype, sel.range);

    // turn listener on again
    this.instance.on(AView.EVENT_ITEM_SELECT, this.listenerItemSelect);
  }

  setParameterSelection(selection: ISelection) {
    if (isSameSelection(this.selection, selection)) {
      return;
    }

    this.instance.changeSelection(selection);
  }

  getParameterSelection() {
    return this.selection;
  }

  matchSelectionLength(length: number) {
    return matchLength(this.desc.selection, length) ||(showAsSmallMultiple(this.desc) && length > 1);
  }

  set mode(mode:EViewMode) {
    if (this._mode === mode) {
      return;
    }
    const b = this._mode;
    this.modeChanged(mode);
    this.fire('modeChanged', this._mode = mode, b);
  }

  protected modeChanged(mode:EViewMode) {
    // update css classes
    this.$viewWrapper
      .classed('t-hide', mode === EViewMode.HIDDEN)
      .classed('t-focus', mode === EViewMode.FOCUS)
      .classed('t-context', mode === EViewMode.CONTEXT)
      .classed('t-active', mode === EViewMode.CONTEXT || mode === EViewMode.FOCUS);
    this.$chooser
      .classed('t-hide', mode === EViewMode.HIDDEN);

    // trigger modeChanged
    this.instance.modeChanged(mode);

    // on focus view scroll into view
    if(mode === EViewMode.FOCUS) {
      this.scrollIntoView();
    }
  }

  private scrollIntoView() {
    const prev = (<any>this.$viewWrapper.node()).previousSibling;
    const scrollToPos = prev ? prev.offsetLeft || 0 : 0;
    const $targid = $(this.$viewWrapper.node()).parent();
    (<any>$targid).scrollTo(scrollToPos, 500, {axis:'x'});
  }

  /**
   * Decide if a chooser for the next view should be shown and if so, which next views are available
   * @param idtype
   * @param range
   */
  private chooseNextViews(idtype: IDType, range: Range) {
    const that = this;

    // show chooser if selection available
    this.$chooser.classed('hidden', range.isNone);

    if(range.isNone) {
      this.$chooser.selectAll('button').classed('active', false);
    }

    findViews(idtype, range).then((views) => {
      const groups = new Map();
      views.forEach((elem) => {
        if(!elem.v.group) {
          elem.v.group = 'Other'; // fallback category if none is present
        }
        if(!groups.has(elem.v.group)) {
          groups.set(elem.v.group, [elem]);
        } else {
          groups.get(elem.v.group).push(elem);
        }
      });

      const sortedGroups = Array.from(groups).sort((a, b) => CHOOSER_CATEGORY_WEIGHTS.get(b[0]) - CHOOSER_CATEGORY_WEIGHTS.get(a[0]));
      const $categories = this.$chooser.selectAll('div.category').data(sortedGroups);

      $categories.enter().append('div').classed('category', true).append('header').append('h1').text((d) => d[0]);
      $categories.exit().remove();

      const $buttons = $categories.selectAll('button').data((d:[string, {enabled: boolean, v: IViewPluginDesc}[]]) => d[1]);

      $buttons.enter().append('button')
        .classed('btn btn-default', true);

      $buttons.text((d) => d.v.name)
        .attr('disabled', (d) => d.v.mockup || !d.enabled ? 'disabled' : null)
        .on('click', function(d) {
          $buttons.classed('active', false);
          d3.select(this).classed('active', true);

          that.fire(ViewWrapper.EVENT_CHOOSE_NEXT_VIEW, d.v.id, idtype, range);
        });

      $buttons.exit().remove();
    });
  }

  get desc() {
    return toViewPluginDesc(this.plugin.desc);
  }

  get mode() {
    return this._mode;
  }

  get node() {
    return <Element>this.$node.node();
  }

  remove() {
    console.log('EVENT_REMOVE');
    this.fire(ViewWrapper.EVENT_REMOVE, this);
  }

  focus() {
    this.fire(ViewWrapper.EVENT_FOCUS, this);
  }
}

export function createContext(graph:ProvenanceGraph, desc: IPluginDesc, ref: IObjectRef<any>):IViewContext {
  return {
    graph,
    desc: toViewPluginDesc(desc),
    ref
  };
}

export function createViewWrapper(graph: ProvenanceGraph, selection: ISelection, parent:Element, plugin:IPluginDesc, options?) {
  return plugin.load().then((p) => new ViewWrapper(graph, selection, parent, p, options));
}

export function replaceViewWrapper(existingView:ViewWrapper, selection: ISelection, plugin:IPluginDesc, options?) {
  return plugin.load().then((p) => existingView.replaceView(selection, p, options));
}
