import { merge } from 'lodash';
import { IDType, SelectOperation, SelectionUtils, IDTypeManager } from 'visyn_core/idtype';
import { BaseUtils } from '../../base/BaseUtils';
import { ADataType } from '../../data/datatype';
import { ObjectNode, IObjectRef, ObjectRefUtils } from './ObjectNode';
import { StateNode } from './StateNode';
import { ActionNode } from './ActionNode';
import { IAction, IProvenanceGraphDataDescription, ICmdFunction, IInverseActionCreator, ICmdResult, IProvenanceGraph } from './ICmd';
import { SlideNode } from './SlideNode';
import { GraphEdge, GraphNode } from '../graph/graph';
import { GraphBase, IGraphDump } from '../graph/GraphBase';
import { ProvenanceGraphDim } from './provenance';
import { ProvenanceGraphUtils } from './ProvenanceGraphUtils';
import { MemoryGraph } from '../graph/MemoryGraph';
import { ActionMetaData } from './ActionMeta';
import { hashPropertyHandler } from '../../base/url/HashPropertyHandler';

export interface IProvenanceGraphDump extends IGraphDump {
  /**
   * Id of the last state node
   */
  act: number | null;

  /**
   * Id of the last action
   */
  lastAction: number | null;
}

export class ProvenanceGraph extends ADataType<IProvenanceGraphDataDescription> implements IProvenanceGraph {
  private static readonly PROPAGATED_EVENTS = ['sync', 'add_edge', 'add_node', 'sync_node', 'sync_edge', 'sync_start'];

  private _actions: ActionNode[] = [];

  private _objects: ObjectNode<any>[] = [];

  private _states: StateNode[] = [];

  private _slides: SlideNode[] = [];

  act: StateNode = null;

  private lastAction: ActionNode = null;

  // currently executing promise
  private currentlyRunning = false;

  executeCurrentActionWithin = -1;

  private nextQueue: (() => any)[] = [];

  constructor(desc: IProvenanceGraphDataDescription, public backend: GraphBase) {
    super(desc);
    this.propagate(this.backend, ...ProvenanceGraph.PROPAGATED_EVENTS);

    if (this.backend.nnodes === 0) {
      this.act = new StateNode('Start');
      this._states.push(this.act);
      this.backend.addNode(this.act);
    } else {
      const { act } = <any>desc;
      this._actions = <any>this.backend.nodes.filter((n) => n instanceof ActionNode);
      this._objects = <any>this.backend.nodes.filter((n) => n instanceof ObjectNode);
      this._states = <any>this.backend.nodes.filter((n) => n instanceof StateNode);
      this._slides = <any>this.backend.nodes.filter((n) => n instanceof SlideNode);
      this.act = <StateNode>(act >= 0 ? this.getStateById(act) : this._states[0]);
    }
  }

  migrateBackend(backend: GraphBase) {
    // asserts that the old backend and the new one have the same nodes inside of them
    this.stopPropagation(this.backend, ...ProvenanceGraph.PROPAGATED_EVENTS);
    this.backend = backend;
    this.propagate(this.backend, ...ProvenanceGraph.PROPAGATED_EVENTS);
    // hack to update the description object
    (<any>this).desc = <IProvenanceGraphDataDescription>backend.desc;
  }

  get isEmpty() {
    return this._states.length <= 1;
  }

  get dim() {
    return [this._actions.length, this._objects.length, this._states.length, this._slides.length];
  }

  selectState(state: StateNode, op: SelectOperation = SelectOperation.SET, type = SelectionUtils.defaultSelectionType, extras = {}) {
    this.fire(`select_state,select_state_${type}`, state, type, op, extras);
    this.idtypes[ProvenanceGraphDim.State].select(type, state ? [this._states.indexOf(state).toString()] : [], op);
  }

  selectSlide(slide: SlideNode, op: SelectOperation = SelectOperation.SET, type = SelectionUtils.defaultSelectionType, extras = {}) {
    this.fire(`select_slide,select_slide_${type}`, slide, type, op, extras);
    this.idtypes[ProvenanceGraphDim.Slide].select(type, slide ? [this._slides.indexOf(slide).toString()] : [], op);
  }

  selectAction(action: ActionNode, op: SelectOperation = SelectOperation.SET, type = SelectionUtils.defaultSelectionType) {
    this.fire(`select_action,select_action_${type}`, action, type, op);
    this.idtypes[ProvenanceGraphDim.Action].select(type, action ? [this._actions.indexOf(action).toString()] : [], op);
  }

  selectedStates(type = SelectionUtils.defaultSelectionType): StateNode[] {
    const sel = this.idtypes[ProvenanceGraphDim.State].selections(type);
    if (sel?.length === 0) {
      return [];
    }
    const lookup = new Map<string, StateNode>();
    this._states.forEach((s) => lookup.set(`${s.id}`, s));
    const nodes: StateNode[] = [];
    sel.forEach((id) => {
      const n = lookup.get(id);
      if (n) {
        nodes.push(n);
      }
    });
    return nodes;
  }

  selectedSlides(type = SelectionUtils.defaultSelectionType): SlideNode[] {
    const sel = this.idtypes[ProvenanceGraphDim.Slide].selections(type);
    if (sel?.length === 0) {
      return [];
    }
    const lookup = new Map<string, SlideNode>();
    this._slides.forEach((s) => lookup.set(`${s.id}`, s));
    const nodes: SlideNode[] = [];
    sel.forEach((id) => {
      const n = lookup.get(id);
      if (n) {
        nodes.push(n);
      }
    });
    return nodes;
  }

  get idtypes(): IDType[] {
    return ['_provenance_actions', '_provenance_objects', '_provenance_states', '_provenance_stories'].map(IDTypeManager.getInstance().resolveIdType);
  }

  clear() {
    const r = this.backend.clear();
    this._states = [];
    this._actions = [];
    this._objects = [];
    this._slides = [];
    this.act = null;
    this.lastAction = null;

    this.act = new StateNode('start');
    this._states.push(this.act);
    this.backend.addNode(this.act);

    this.fire('clear');
    return Promise.resolve(r);
  }

  get states() {
    return this._states;
  }

  getStateById(id: number) {
    return this._states.find((s) => s.id === id);
  }

  get actions() {
    return this._actions;
  }

  getActionById(id: number) {
    return this._actions.find((s) => s.id === id);
  }

  get objects() {
    return this._objects;
  }

  getObjectById(id: number) {
    return this._objects.find((s) => s.id === id);
  }

  get stories() {
    return this._slides;
  }

  getSlideById(id: number) {
    return this._slides.find((s) => s.id === id);
  }

  getSlideChains() {
    return this.stories.filter((n) => n.isStart);
  }

  getSlides(): SlideNode[][] {
    return this.getSlideChains().map(SlideNode.toSlidePath);
  }

  get edges() {
    return this.backend.edges;
  }

  private addEdge(s: GraphNode, type: string, t: GraphNode, attrs: any = {}) {
    const l = new GraphEdge(type, s, t);
    Object.keys(attrs).forEach((attr) => l.setAttr(attr, attrs[attr]));
    this.backend.addEdge(l);
    return l;
  }

  private createAction(meta: ActionMetaData, functionId: string, f: ICmdFunction, inputs: IObjectRef<any>[] = [], parameter: any = {}) {
    const r = new ActionNode(meta, functionId, f, parameter);
    return this.initAction(r, inputs);
  }

  private initAction(r: ActionNode, inputs: IObjectRef<any>[] = []) {
    const inobjects = inputs.map((i) => ProvenanceGraph.findInArray(this._objects, i));
    this._actions.push(r);
    this.backend.addNode(r);
    this.fire('add_action', r);
    inobjects.forEach((obj, i) => {
      this.addEdge(r, 'requires', obj, { index: i });
    });
    return r;
  }

  createInverse(action: ActionNode, inverter: IInverseActionCreator) {
    const { creates } = action;
    const { removes } = action;
    const i = inverter.call(action, action.requires, creates, removes);
    const inverted = this.createAction(i.meta, i.id, i.f, i.inputs, i.parameter);
    inverted.onceExecuted = true;
    this.addEdge(inverted, 'inverses', action);

    // the inverted action should create the removed ones and removes the crated ones
    removes.forEach((c, index) => {
      this.addEdge(inverted, 'creates', c, { index });
    });
    creates.forEach((c) => {
      this.addEdge(inverted, 'removes', c);
    });

    // create the loop in the states
    this.addEdge(StateNode.resultsIn(action), 'next', inverted);
    this.addEdge(inverted, 'resultsIn', StateNode.previous(action));

    return inverted;
  }

  push(action: IAction): Promise<ICmdResult>;
  push(meta: ActionMetaData, functionId: string, f: ICmdFunction, inputs: IObjectRef<any>[], parameter: any): Promise<ICmdResult>;
  push(arg: any, functionId = '', f: ICmdFunction = null, inputs: IObjectRef<any>[] = [], parameter: any = {}) {
    return this.inOrder(() => {
      if (arg instanceof ActionMetaData) {
        return this.run(this.createAction(<ActionMetaData>arg, functionId, f, inputs, parameter), null);
      }
      const a = <IAction>arg;
      return this.run(this.createAction(a.meta, a.id, a.f, a.inputs || [], a.parameter || {}), null);
    });
  }

  pushWithResult(action: IAction, result: ICmdResult) {
    return this.inOrder(() => {
      const a = this.createAction(action.meta, action.id, action.f, action.inputs || [], action.parameter || {});
      return this.run(a, result);
    });
  }

  findObject<T>(value: T) {
    const r = this._objects.find((obj) => obj.value === value);
    if (r) {
      return r;
    }
    return null;
  }

  addObject<T>(value: T, name: string = value ? value.toString() : 'Null', category = ObjectRefUtils.category.data, hash = `${name}_${category}`) {
    return this.addObjectImpl(value, name, category, hash, true);
  }

  addJustObject<T>(value: T, name: string = value ? value.toString() : 'Null', category = ObjectRefUtils.category.data, hash = `${name}_${category}`) {
    return this.addObjectImpl(value, name, category, hash, false);
  }

  private addObjectImpl<T>(
    value: T,
    name: string = value ? value.toString() : 'Null',
    category = ObjectRefUtils.category.data,
    hash = `${name}_${category}`,
    createEdge = false,
  ) {
    const r = new ObjectNode<T>(value, name, category, hash);
    this._objects.push(r);
    this.backend.addNode(r);
    if (createEdge) {
      this.addEdge(this.act, 'consistsOf', r);
    }
    this.fire('add_object', r);
    return r;
  }

  private resolve(arr: IObjectRef<any>[]) {
    return arr.map((r) => {
      if (r instanceof ObjectNode) {
        return <ObjectNode<any>>r;
      }
      if ((<any>r)._resolvesTo instanceof ObjectNode) {
        return <ObjectNode<any>>(<any>r)._resolvesTo;
      }
      // else create a new instance
      const result = this.addJustObject(r.value, r.name, r.category, r.hash);
      (<any>r)._resolvesTo = result;
      return result;
    });
  }

  private static findInArray(arr: ObjectNode<any>[], r: IObjectRef<any>) {
    if (r instanceof ObjectNode) {
      return <ObjectNode<any>>r;
    }
    if ((<any>r)._resolvesTo instanceof ObjectNode) {
      return <ObjectNode<any>>(<any>r)._resolvesTo;
    }
    // else create a new instance
    const result = arr.find(ProvenanceGraphUtils.findMetaObject(r));
    (<any>r)._resolvesTo = result;
    return result;
  }

  findOrAddObject<T>(i: T | IObjectRef<T>, name?: string, type?: any): ObjectNode<T> {
    return this.findOrAddObjectImpl(i, name, type, true);
  }

  findOrAddJustObject<T>(i: T | IObjectRef<T>, name?: string, type?: any): ObjectNode<T> {
    return this.findOrAddObjectImpl(i, name, type, false);
  }

  private findOrAddObjectImpl<T>(i: T | IObjectRef<T>, name?: string, type?: any, createEdge = false): ObjectNode<T> {
    let r: ObjectNode<T>;
    const j = <any>i;
    if (i instanceof ObjectNode) {
      return <ObjectNode<T>>i;
    }
    if (j._resolvesTo instanceof ObjectNode) {
      return <ObjectNode<T>>j._resolvesTo;
    }
    if (j.hasOwnProperty('value') && j.hasOwnProperty('name')) {
      // sounds like an proxy
      j.category = j.category || ObjectRefUtils.category.data;
      r = this._objects.find(ProvenanceGraphUtils.findMetaObject(j));
      if (r) {
        if (r.value === null) {
          // restore instance
          r.value = j.value;
        }
        // cache result
        j._resolvesTo = r;
        return r;
      }
      return this.addObjectImpl(j.value, j.name, j.category, j.hash, createEdge);
    } // raw value
    r = this._objects.find(
      (obj) => (obj.value === null || obj.value === i) && (name === null || obj.name === name) && (type === null || type === obj.category),
    );
    if (r) {
      if (r.value === null) {
        // restore instance
        r.value = <T>i;
      }
      return r;
    }
    return this.addObjectImpl(<any>i, name, type, `${name}_${type}`, createEdge);
  }

  private inOrder(f: () => PromiseLike<any>): PromiseLike<any> {
    if (this.currentlyRunning) {
      let helper: () => void;
      const r = new Promise((resolve) => {
        helper = resolve.bind(this);
      });
      this.nextQueue.push(helper);
      return r.then(f);
    }
    return f();
  }

  private executedAction(action: ActionNode, newState: boolean, result: ICmdResult) {
    const current = this.act;
    const next = StateNode.resultsIn(action);
    result = merge({ created: [], removed: [], inverse: null, consumed: 0 }, result);
    this.fire('executed', action, result);

    const firstTime = !action.onceExecuted;
    action.onceExecuted = true;

    let created: ObjectNode<any>[];
    let removed: ObjectNode<any>[];

    if (firstTime) {
      // create an link outputs
      //
      created = this.resolve(result.created);
      created.forEach((c, i) => {
        this.addEdge(action, 'creates', c, { index: i });
      });
      // a removed one should be part of the inputs
      const { requires } = action;
      removed = result.removed.map((r) => ProvenanceGraph.findInArray(requires, r));
      removed.forEach((c) => {
        c.value = null; // free reference
        this.addEdge(action, 'removes', c);
      });

      // update new state
      if (newState) {
        const objs = current.consistsOf;
        objs.push.apply(objs, created);
        removed.forEach((r) => {
          const i = objs.indexOf(r);
          objs.splice(i, 1);
        });
        objs.forEach((obj) => this.addEdge(next, 'consistsOf', obj));
      }
      this.fire('executed_first', action, next);
    } else {
      created = action.creates;
      // update creates reference values
      created.forEach((c, i) => {
        c.value = result.created[i].value;
      });
      removed = action.removes;
      removed.forEach((c) => (c.value = null));
    }
    result.inverse = ProvenanceGraphUtils.asFunction(result.inverse);
    ProvenanceGraph.updateInverse(action, this, <IInverseActionCreator>result.inverse);

    this.switchToImpl(action, next);

    return {
      action,
      state: next,
      created,
      removed,
      consumed: result.consumed,
    };
  }

  private run(action: ActionNode, result: ICmdResult, withinMilliseconds: number | (() => number) = -1): PromiseLike<ICmdResult> {
    let next: StateNode = StateNode.resultsIn(action);
    let newState = false;
    if (!next) {
      // create a new state
      newState = true;
      this.addEdge(this.act, 'next', action);
      next = this.makeState(action.meta.name);
      this.addEdge(action, 'resultsIn', next);
    }
    this.fire('execute', action);
    if (hashPropertyHandler.has('debug')) {
      console.log(`execute ${action.meta} ${action.f_id}`);
    }
    this.currentlyRunning = true;

    if (typeof withinMilliseconds === 'function') {
      withinMilliseconds = (<any>withinMilliseconds)();
    }
    this.executeCurrentActionWithin = <number>withinMilliseconds;

    const runningAction = (result ? Promise.resolve(result) : ProvenanceGraph.execute(action, this, this.executeCurrentActionWithin)).then(
      this.executedAction.bind(this, action, newState),
    );

    runningAction.then(() => {
      const q = this.nextQueue.shift();
      if (q) {
        q();
      } else {
        this.currentlyRunning = false;
      }
    });

    return runningAction;
  }

  private switchToImpl(action: ActionNode, state: StateNode) {
    let bak: any = this.act;
    this.act = state;
    this.fire('switch_state', state, bak);

    bak = this.lastAction;
    this.lastAction = action;
    this.fire('switch_action', action, bak);
  }

  /**
   * execute a bunch of already executed actions
   * @param actions
   */
  private async runChain(actions: ActionNode[], withinMilliseconds = -1): Promise<any> {
    if (actions.length === 0) {
      if (withinMilliseconds > 0) {
        return BaseUtils.resolveIn(withinMilliseconds).then(() => []);
      }
      return Promise.resolve([]);
    }
    // actions = compress(actions, null);
    const last = actions[actions.length - 1];

    const torun = await ProvenanceGraphUtils.compressGraph(actions);

    let remaining = withinMilliseconds;

    function guessTime(index: number) {
      const left = torun.length - index;
      return () => (remaining < 0 ? -1 : remaining / left); // uniformly distribute
    }

    function updateTime(consumed: number) {
      remaining -= consumed;
    }

    this.fire('run_chain', torun);
    const results = [];
    for (let i = 0; i < torun.length; ++i) {
      const action = torun[i];
      // eslint-disable-next-line no-await-in-loop
      const result = await this.run(action, null, withinMilliseconds < 0 ? -1 : guessTime(i));
      results.push(result);
      updateTime(result.consumed);
    }

    if (this.act !== StateNode.resultsIn(last)) {
      this.switchToImpl(last, StateNode.resultsIn(last));
    }
    this.fire('ran_chain', this.act, torun);
    return results;
  }

  undo() {
    if (!this.lastAction) {
      return Promise.resolve(null);
    }
    // create and store the inverse
    if (this.lastAction.inverses != null) {
      // undo and undoing should still go one up
      return this.jumpTo(this.act.previousState);
    }
    return this.inOrder(() => this.run(ProvenanceGraph.getOrCreateInverse(this.lastAction, this), null));
  }

  jumpTo(state: StateNode, withinMilliseconds = -1) {
    return this.inOrder(() => {
      let actions: ActionNode[] = [];
      const { act } = this;
      if (act === state) {
        // jump to myself
        return withinMilliseconds >= 0 ? BaseUtils.resolveIn(withinMilliseconds).then(() => []) : Promise.resolve([]);
      }
      // lets look at the simple past
      const actPath = act.path;
      const targetPath = state.path;
      const common = ProvenanceGraphUtils.findCommon(actPath, targetPath);
      if (common) {
        const toRevert = actPath.slice(common.i + 1).reverse();
        const toForward = targetPath.slice(common.j + 1);
        actions = actions.concat(toRevert.map((r) => ProvenanceGraph.getOrCreateInverse(r.resultsFrom[0], this)));
        actions = actions.concat(toForward.map((r) => r.resultsFrom[0]));
      }
      // no in the direct branches maybe in different loop instances?
      // TODO
      return this.runChain(actions, withinMilliseconds);
    });
  }

  /**
   *
   * @param action the action to fork and attach to target
   * @param target the state to attach the given action and all of the rest
   * @param objectReplacements mappings of object replacements
   * @returns {boolean}
   */
  fork(action: ActionNode, target: StateNode, objectReplacements: { from: IObjectRef<any>; to: IObjectRef<any> }[] = []) {
    // sanity check if target is a child of target ... bad
    // collect all states
    const all: StateNode[] = [];
    const queue = [StateNode.resultsIn(action)];
    while (queue.length > 0) {
      const next = queue.shift();
      if (all.indexOf(next) >= 0) {
        continue;
      }
      all.push(next);
      queue.push.apply(queue, next.nextStates);
    }
    if (all.indexOf(target) >= 0) {
      return false; // target is a child of state
    }

    const targetObjects = target.consistsOf;
    const sourceObjects = StateNode.previous(action).consistsOf;
    // function isSame(a: any[], b : any[]) {
    //  return a.length === b.length && a.every((ai, i) => ai === b[i]);
    // }
    // if (isSame(targetObjects, sourceObjects)) {
    // no state change ~ similar state, just create a link
    // we can copy the action and point to the same target
    //  const clone = this.initAction(action.clone(), action.requires);
    //  this.addEdge(target, 'next', clone);
    //  this.addEdge(clone, 'resultsIn', action.resultsIn);
    // } else {
    const removedObjects = sourceObjects.filter((o) => targetObjects.indexOf(o) < 0);
    const replacements: { [id: string]: IObjectRef<any> } = {};
    objectReplacements.forEach((d) => (replacements[this.findOrAddObject(d.from).id] = d.to));
    // need to copy all the states and actions
    this.copyBranch(action, target, removedObjects, replacements);
    // }

    this.fire('forked_branch', action, target);
    return true;
  }

  private copyAction(action: ActionNode, appendTo: StateNode, objectReplacements: { [id: string]: IObjectRef<any> }) {
    const clone = this.initAction(
      action.clone(),
      action.requires.map((a) => objectReplacements[String(a.id)] || a),
    );
    this.addEdge(appendTo, 'next', clone);
    const s = this.makeState(StateNode.resultsIn(action).name, StateNode.resultsIn(action).description);
    this.addEdge(clone, 'resultsIn', s);
    return s;
  }

  private copyBranch(action: ActionNode, target: StateNode, removedObject: ObjectNode<any>[], objectReplacements: { [id: string]: IObjectRef<any> }) {
    const queue = [{ a: action, b: target }];
    while (queue.length > 0) {
      const next = queue.shift();
      let { b } = next;
      const { a } = next;
      const someRemovedObjectRequired = a.requires.some((ai) => removedObject.indexOf(ai) >= 0 && !(String(ai.id) in objectReplacements));
      if (!someRemovedObjectRequired) {
        // copy it and create a new pair to execute
        b = this.copyAction(a, next.b, objectReplacements);
      }
      queue.push.apply(
        queue,
        StateNode.resultsIn(a).next.map((aa) => ({ a: aa, b })),
      );
    }
  }

  private makeState(name: string, description = '') {
    const s = new StateNode(name, description);
    this._states.push(s);
    this.backend.addNode(s);
    this.fire('add_state', s);
    return s;
  }

  persist(): IProvenanceGraphDump {
    return {
      ...this.backend.persist(),
      act: this.act ? this.act.id : null,
      lastAction: this.lastAction ? this.lastAction.id : null,
    };
  }

  /*
   restore(persisted: any) {
   const lookup = {},
   lookupFun = (id) => lookup[id];
   const types = {
   action: ActionNode,
   state: StateNode,
   object: ObjectNode
   };
   this.clear();
   persisted.nodes.forEach((p) => {
   var n = types[p.type].restore(p, factory);
   lookup[n.id] = n;
   if (n instanceof ActionNode) {
   this._actions.push(n);
   } else if (n instanceof StateNode) {
   this._states.push(n);
   } else if (n instanceof ObjectNode) {
   this._objects.push(n);
   }
   this.backend.addNode(n);
   });
   if (persisted.act) {
   this.act = lookup[persisted.id];
   }
   if (persisted.lastAction) {
   this.lastAction = lookup[persisted.lastAction];
   }

   persisted.edges.forEach((p) => {
   var n = (new graph.GraphEdge()).restore(p, lookupFun);
   this.backend.addEdge(n);
   });
   return this;
   } */

  wrapAsSlide(state: StateNode) {
    const node = new SlideNode();
    node.name = state.name;
    this.addEdge(node, 'jumpTo', state);
    this._slides.push(node);
    this.backend.addNode(node);
    this.fire('add_slide', node);
    return node;
  }

  cloneSingleSlideNode(state: SlideNode) {
    const clone = state.state != null ? this.wrapAsSlide(state.state) : this.makeTextSlide();
    state.attrs.forEach((attr) => {
      if (attr !== 'annotations') {
        clone.setAttr(attr, state.getAttr(attr, null));
      }
    });
    clone.setAttr(
      'annotations',
      state.annotations.map((a) => merge({}, a)),
    );
    return clone;
  }

  /**
   * creates a new slide of the given StateNode by jumping to them
   * @param states
   */
  extractSlide(states: StateNode[], addStartEnd = true): SlideNode {
    const addSlide = (node: SlideNode) => {
      this._slides.push(node);
      this.backend.addNode(node);
      this.fire('add_slide', node);
      return node;
    };
    let slide: SlideNode = addStartEnd ? addSlide(SlideNode.makeText('Unnamed Story')) : null;
    let prev = slide;
    states.forEach((s, i) => {
      const node = addSlide(new SlideNode());
      node.name = s.name;
      this.addEdge(node, 'jumpTo', s);
      if (prev) {
        this.addEdge(prev, 'next', node);
      } else {
        slide = node;
      }
      prev = node;
    });

    if (addStartEnd) {
      const last = SlideNode.makeText('Thanks');
      addSlide(last);
      this.addEdge(prev, 'next', last);
    }

    this.fire('extract_slide', slide);
    this.selectSlide(slide);
    return slide;
  }

  startNewSlide(title?: string, states: StateNode[] = []) {
    const s = this.makeTextSlide(title);
    if (states.length > 0) {
      const s2 = this.extractSlide(states, false);
      this.addEdge(s, 'next', s2);
    }
    this.fire('start_slide', s);
    return s;
  }

  makeTextSlide(title?: string) {
    const s = SlideNode.makeText(title);
    this._slides.push(s);
    this.backend.addNode(s);
    this.fire('add_slide', s);
    return s;
  }

  insertIntoSlide(toInsert: SlideNode, slide: SlideNode, beforeIt = false) {
    this.moveSlide(toInsert, slide, beforeIt);
  }

  appendToSlide(slide: SlideNode, elem: SlideNode) {
    const s = SlideNode.toSlidePath(slide);
    return this.moveSlide(elem, s[s.length - 1], false);
  }

  moveSlide(node: SlideNode, to: SlideNode, beforeIt = false) {
    if ((beforeIt && node.next === to) || (!beforeIt && node.previous === to)) {
      return; // already matches
    }
    // 1. extract the node
    // create other links
    const prev = node.previous;
    if (prev) {
      node.nexts.forEach((n) => {
        this.addEdge(prev, 'next', n);
      });
    }
    // remove links
    this.edges
      .filter((e) => (e.source === node || e.target === node) && e.type === 'next')
      .forEach((e) => {
        this.backend.removeEdge(e);
      });

    // insert into the new place
    if (beforeIt) {
      const tprev = to.previous;
      if (tprev) {
        this.edges
          .filter((e) => e.target === to && e.type === 'next')
          .forEach((e) => {
            this.backend.removeEdge(e);
          });
        this.addEdge(tprev, 'next', node);
        this.addEdge(node, 'next', to);
      }
      this.addEdge(node, 'next', to);
    } else {
      const tnexts = to.nexts;
      if (tnexts.length > 0) {
        this.edges
          .filter((e) => e.source === to && e.type === 'next')
          .forEach((e) => {
            this.backend.removeEdge(e);
          });
        tnexts.forEach((next) => {
          this.addEdge(node, 'next', next);
        });
      }
      this.addEdge(to, 'next', node);
    }
    this.fire('move_slide', node, to, beforeIt);
  }

  removeSlideNode(node: SlideNode) {
    const prev = node.previous;
    if (prev) {
      node.nexts.forEach((n) => {
        this.addEdge(prev, 'next', n);
      });
    }
    this.edges
      .filter((e) => e.source === node || e.target === node)
      .forEach((e) => {
        this.backend.removeEdge(e);
      });
    this._slides.splice(this._slides.indexOf(node), 1);
    this.backend.removeNode(node);
    this.fire('remove_slide', node);
  }

  removeFullSlide(node: SlideNode) {
    // go to the beginning
    while (node.previous) {
      node = node.previous;
    }
    const bak = node;
    while (node) {
      const { next } = node;
      this.removeSlideNode(node);
      node = next;
    }
    this.fire('destroy_slide', bak);
  }

  setSlideJumpToTarget(node: SlideNode, state: StateNode) {
    const old = node.outgoing.filter(GraphEdge.isGraphType('jumpTo'))[0];
    if (old) {
      this.backend.removeEdge(old);
    }
    if (state) {
      this.addEdge(node, 'jumpTo', state);
    }
    this.fire('set_jump_target', node, old ? old.target : null, state);
  }

  static createDummy() {
    const desc: IProvenanceGraphDataDescription = {
      type: 'provenance_graph',
      id: 'dummy',
      name: 'dummy',
      fqname: 'dummy',
      description: '',
      creator: 'Anonymous',
      ts: Date.now(),
      size: [0, 0],
      attrs: {
        graphtype: 'provenance_graph',
        of: 'dummy',
      },
    };
    return new ProvenanceGraph(desc, new MemoryGraph(desc, [], [], ProvenanceGraphUtils.provenanceGraphFactory()));
  }

  static getOrCreateInverse(node: ActionNode, graph: ProvenanceGraph) {
    const i = node.inversedBy;
    if (i) {
      return i;
    }
    if (node.inverter) {
      return graph.createInverse(node, node.inverter);
    }
    node.inverter = null; // not needed anymore
    return null;
  }

  static updateInverse(node: ActionNode, graph: ProvenanceGraph, inverter: IInverseActionCreator) {
    const i = node.inversedBy;
    if (i) {
      // update with the actual values / parameter only
      const c = inverter.call(node, node.requires, node.creates, node.removes);
      i.parameter = c.parameter;
      node.inverter = null;
    } else if (!node.isInverse) {
      // create inverse action immediatelly
      graph.createInverse(node, inverter);
      node.inverter = null;
    } else {
      node.inverter = inverter;
    }
  }

  static execute(node: ActionNode, graph: ProvenanceGraph, withinMilliseconds: number): PromiseLike<ICmdResult> {
    const r = node.f.call(node, node.requires, node.parameter, graph, <number>withinMilliseconds);
    return Promise.resolve(r);
  }
}
