import { merge } from 'lodash';
import { IDTypeManager, SelectOperation, SelectionUtils } from 'visyn_core/idtype';
import { ActionMetaData } from './ActionMeta';
import { ActionNode } from './ActionNode';
import { ObjectNode, ObjectRefUtils } from './ObjectNode';
import { ProvenanceGraphUtils } from './ProvenanceGraphUtils';
import { SlideNode } from './SlideNode';
import { StateNode } from './StateNode';
import { ProvenanceGraphDim } from './provenance';
import { BaseUtils } from '../../base/BaseUtils';
import { hashPropertyHandler } from '../../base/url/HashPropertyHandler';
import { ADataType } from '../../data/datatype';
import { MemoryGraph } from '../graph/MemoryGraph';
import { GraphEdge } from '../graph/graph';
export class ProvenanceGraph extends ADataType {
    constructor(desc, backend) {
        super(desc);
        this.backend = backend;
        this._actions = [];
        this._objects = [];
        this._states = [];
        this._slides = [];
        this.act = null;
        this.lastAction = null;
        // currently executing promise
        this.currentlyRunning = false;
        this.executeCurrentActionWithin = -1;
        this.nextQueue = [];
        this.propagate(this.backend, ...ProvenanceGraph.PROPAGATED_EVENTS);
        if (this.backend.nnodes === 0) {
            this.act = new StateNode('Start');
            this._states.push(this.act);
            this.backend.addNode(this.act);
        }
        else {
            const { act } = desc;
            this._actions = this.backend.nodes.filter((n) => n instanceof ActionNode);
            this._objects = this.backend.nodes.filter((n) => n instanceof ObjectNode);
            this._states = this.backend.nodes.filter((n) => n instanceof StateNode);
            this._slides = this.backend.nodes.filter((n) => n instanceof SlideNode);
            this.act = (act >= 0 ? this.getStateById(act) : this._states[0]);
        }
    }
    /**
     * Switches the storage backend of the current provenance graph
     * @param backend Remote or local backend for storing the graph data
     */
    migrateBackend(backend) {
        // asserts that the old backend and the new one have the same nodes inside of them
        this.stopPropagation(this.backend, ...ProvenanceGraph.PROPAGATED_EVENTS);
        this.backend = backend;
        this.propagate(this.backend, ...ProvenanceGraph.PROPAGATED_EVENTS);
        // hack to update the description object
        this.desc = backend.desc;
    }
    get isEmpty() {
        return this._states.length <= 1;
    }
    get dim() {
        return [this._actions.length, this._objects.length, this._states.length, this._slides.length];
    }
    selectState(state, op = SelectOperation.SET, type = SelectionUtils.defaultSelectionType, extras = {}) {
        this.fire(`select_state,select_state_${type}`, state, type, op, extras);
        this.idtypes[ProvenanceGraphDim.State].select(type, state ? [this._states.indexOf(state).toString()] : [], op);
    }
    selectSlide(slide, op = SelectOperation.SET, type = SelectionUtils.defaultSelectionType, extras = {}) {
        this.fire(`select_slide,select_slide_${type}`, slide, type, op, extras);
        this.idtypes[ProvenanceGraphDim.Slide].select(type, slide ? [this._slides.indexOf(slide).toString()] : [], op);
    }
    selectAction(action, op = SelectOperation.SET, type = SelectionUtils.defaultSelectionType) {
        this.fire(`select_action,select_action_${type}`, action, type, op);
        this.idtypes[ProvenanceGraphDim.Action].select(type, action ? [this._actions.indexOf(action).toString()] : [], op);
    }
    selectedStates(type = SelectionUtils.defaultSelectionType) {
        const sel = this.idtypes[ProvenanceGraphDim.State].selections(type);
        if (sel?.length === 0) {
            return [];
        }
        const lookup = new Map();
        this._states.forEach((s) => lookup.set(`${s.id}`, s));
        const nodes = [];
        sel.forEach((id) => {
            const n = lookup.get(id);
            if (n) {
                nodes.push(n);
            }
        });
        return nodes;
    }
    selectedSlides(type = SelectionUtils.defaultSelectionType) {
        const sel = this.idtypes[ProvenanceGraphDim.Slide].selections(type);
        if (sel?.length === 0) {
            return [];
        }
        const lookup = new Map();
        this._slides.forEach((s) => lookup.set(`${s.id}`, s));
        const nodes = [];
        sel.forEach((id) => {
            const n = lookup.get(id);
            if (n) {
                nodes.push(n);
            }
        });
        return nodes;
    }
    get idtypes() {
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
    getStateById(id) {
        return this._states.find((s) => s.id === id);
    }
    get actions() {
        return this._actions;
    }
    getActionById(id) {
        return this._actions.find((s) => s.id === id);
    }
    get objects() {
        return this._objects;
    }
    getObjectById(id) {
        return this._objects.find((s) => s.id === id);
    }
    get stories() {
        return this._slides;
    }
    getSlideById(id) {
        return this._slides.find((s) => s.id === id);
    }
    getSlideChains() {
        return this.stories.filter((n) => n.isStart);
    }
    getSlides() {
        return this.getSlideChains().map(SlideNode.toSlidePath);
    }
    get edges() {
        return this.backend.edges;
    }
    addEdge(s, type, t, attrs = {}) {
        const l = new GraphEdge(type, s, t);
        Object.keys(attrs).forEach((attr) => l.setAttr(attr, attrs[attr]));
        this.backend.addEdge(l);
        return l;
    }
    createAction(meta, functionId, f, inputs = [], parameter = {}) {
        const r = new ActionNode(meta, functionId, f, parameter);
        return this.initAction(r, inputs);
    }
    initAction(r, inputs = []) {
        const inobjects = inputs.map((i) => ProvenanceGraph.findInArray(this._objects, i));
        this._actions.push(r);
        this.backend.addNode(r);
        this.fire('add_action', r);
        inobjects.forEach((obj, i) => {
            this.addEdge(r, 'requires', obj, { index: i });
        });
        return r;
    }
    createInverse(action, inverter) {
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
    push(arg, functionId = '', f = null, inputs = [], parameter = {}) {
        return this.inOrder(() => {
            if (arg instanceof ActionMetaData) {
                return this.run(this.createAction(arg, functionId, f, inputs, parameter), null);
            }
            const a = arg;
            return this.run(this.createAction(a.meta, a.id, a.f, a.inputs || [], a.parameter || {}), null);
        });
    }
    pushWithResult(action, result) {
        return this.inOrder(() => {
            const a = this.createAction(action.meta, action.id, action.f, action.inputs || [], action.parameter || {});
            return this.run(a, result);
        });
    }
    findObject(value) {
        const r = this._objects.find((obj) => obj.value === value);
        if (r) {
            return r;
        }
        return null;
    }
    addObject(value, name = value ? value.toString() : 'Null', category = ObjectRefUtils.category.data, hash = `${name}_${category}`) {
        return this.addObjectImpl(value, name, category, hash, true);
    }
    addJustObject(value, name = value ? value.toString() : 'Null', category = ObjectRefUtils.category.data, hash = `${name}_${category}`) {
        return this.addObjectImpl(value, name, category, hash, false);
    }
    addObjectImpl(value, name = value ? value.toString() : 'Null', category = ObjectRefUtils.category.data, hash = `${name}_${category}`, createEdge = false) {
        const r = new ObjectNode(value, name, category, hash);
        this._objects.push(r);
        this.backend.addNode(r);
        if (createEdge) {
            this.addEdge(this.act, 'consistsOf', r);
        }
        this.fire('add_object', r);
        return r;
    }
    resolve(arr) {
        return arr.map((r) => {
            if (r instanceof ObjectNode) {
                return r;
            }
            if (r._resolvesTo instanceof ObjectNode) {
                return r._resolvesTo;
            }
            // else create a new instance
            const result = this.addJustObject(r.value, r.name, r.category, r.hash);
            r._resolvesTo = result;
            return result;
        });
    }
    static findInArray(arr, r) {
        if (r instanceof ObjectNode) {
            return r;
        }
        if (r._resolvesTo instanceof ObjectNode) {
            return r._resolvesTo;
        }
        // else create a new instance
        const result = arr.find(ProvenanceGraphUtils.findMetaObject(r));
        r._resolvesTo = result;
        return result;
    }
    findOrAddObject(i, name, type) {
        return this.findOrAddObjectImpl(i, name, type, true);
    }
    findOrAddJustObject(i, name, type) {
        return this.findOrAddObjectImpl(i, name, type, false);
    }
    findOrAddObjectImpl(i, name, type, createEdge = false) {
        let r;
        const j = i;
        if (i instanceof ObjectNode) {
            return i;
        }
        if (j._resolvesTo instanceof ObjectNode) {
            return j._resolvesTo;
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
        r = this._objects.find((obj) => (obj.value === null || obj.value === i) && (name === null || obj.name === name) && (type === null || type === obj.category));
        if (r) {
            if (r.value === null) {
                // restore instance
                r.value = i;
            }
            return r;
        }
        return this.addObjectImpl(i, name, type, `${name}_${type}`, createEdge);
    }
    inOrder(f) {
        if (this.currentlyRunning) {
            let helper;
            const r = new Promise((resolve) => {
                helper = resolve.bind(this);
            });
            this.nextQueue.push(helper);
            return r.then(f);
        }
        return f();
    }
    executedAction(action, newState, result) {
        const current = this.act;
        const next = StateNode.resultsIn(action);
        result = merge({ created: [], removed: [], inverse: null, consumed: 0 }, result);
        this.fire('executed', action, result);
        const firstTime = !action.onceExecuted;
        action.onceExecuted = true;
        let created;
        let removed;
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
        }
        else {
            created = action.creates;
            // update creates reference values
            created.forEach((c, i) => {
                c.value = result.created[i].value;
            });
            removed = action.removes;
            removed.forEach((c) => (c.value = null));
        }
        result.inverse = ProvenanceGraphUtils.asFunction(result.inverse);
        ProvenanceGraph.updateInverse(action, this, result.inverse);
        this.switchToImpl(action, next);
        return {
            action,
            state: next,
            created,
            removed,
            consumed: result.consumed,
        };
    }
    run(action, result, withinMilliseconds = -1) {
        let next = StateNode.resultsIn(action);
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
            withinMilliseconds = withinMilliseconds();
        }
        this.executeCurrentActionWithin = withinMilliseconds;
        const runningAction = (result ? Promise.resolve(result) : ProvenanceGraph.execute(action, this, this.executeCurrentActionWithin)).then(this.executedAction.bind(this, action, newState));
        runningAction.then(() => {
            const q = this.nextQueue.shift();
            if (q) {
                q();
            }
            else {
                this.currentlyRunning = false;
            }
        });
        return runningAction;
    }
    switchToImpl(action, state) {
        let bak = this.act;
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
    async runChain(actions, withinMilliseconds = -1) {
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
        function guessTime(index) {
            const left = torun.length - index;
            return () => (remaining < 0 ? -1 : remaining / left); // uniformly distribute
        }
        function updateTime(consumed) {
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
    jumpTo(state, withinMilliseconds = -1) {
        return this.inOrder(() => {
            let actions = [];
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
    fork(action, target, objectReplacements = []) {
        // sanity check if target is a child of target ... bad
        // collect all states
        const all = [];
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
        const replacements = {};
        objectReplacements.forEach((d) => (replacements[this.findOrAddObject(d.from).id] = d.to));
        // need to copy all the states and actions
        this.copyBranch(action, target, removedObjects, replacements);
        // }
        this.fire('forked_branch', action, target);
        return true;
    }
    copyAction(action, appendTo, objectReplacements) {
        const clone = this.initAction(action.clone(), action.requires.map((a) => objectReplacements[String(a.id)] || a));
        this.addEdge(appendTo, 'next', clone);
        const s = this.makeState(StateNode.resultsIn(action).name, StateNode.resultsIn(action).description);
        this.addEdge(clone, 'resultsIn', s);
        return s;
    }
    copyBranch(action, target, removedObject, objectReplacements) {
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
            queue.push.apply(queue, StateNode.resultsIn(a).next.map((aa) => ({ a: aa, b })));
        }
    }
    makeState(name, description = '') {
        const s = new StateNode(name, description);
        this._states.push(s);
        this.backend.addNode(s);
        this.fire('add_state', s);
        return s;
    }
    persist() {
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
    wrapAsSlide(state) {
        const node = new SlideNode();
        node.name = state.name;
        this.addEdge(node, 'jumpTo', state);
        this._slides.push(node);
        this.backend.addNode(node);
        this.fire('add_slide', node);
        return node;
    }
    cloneSingleSlideNode(state) {
        const clone = state.state != null ? this.wrapAsSlide(state.state) : this.makeTextSlide();
        state.attrs.forEach((attr) => {
            if (attr !== 'annotations') {
                clone.setAttr(attr, state.getAttr(attr, null));
            }
        });
        clone.setAttr('annotations', state.annotations.map((a) => merge({}, a)));
        return clone;
    }
    /**
     * creates a new slide of the given StateNode by jumping to them
     * @param states
     */
    extractSlide(states, addStartEnd = true) {
        const addSlide = (node) => {
            this._slides.push(node);
            this.backend.addNode(node);
            this.fire('add_slide', node);
            return node;
        };
        let slide = addStartEnd ? addSlide(SlideNode.makeText('Unnamed Story')) : null;
        let prev = slide;
        states.forEach((s, i) => {
            const node = addSlide(new SlideNode());
            node.name = s.name;
            this.addEdge(node, 'jumpTo', s);
            if (prev) {
                this.addEdge(prev, 'next', node);
            }
            else {
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
    startNewSlide(title, states = []) {
        const s = this.makeTextSlide(title);
        if (states.length > 0) {
            const s2 = this.extractSlide(states, false);
            this.addEdge(s, 'next', s2);
        }
        this.fire('start_slide', s);
        return s;
    }
    makeTextSlide(title) {
        const s = SlideNode.makeText(title);
        this._slides.push(s);
        this.backend.addNode(s);
        this.fire('add_slide', s);
        return s;
    }
    insertIntoSlide(toInsert, slide, beforeIt = false) {
        this.moveSlide(toInsert, slide, beforeIt);
    }
    appendToSlide(slide, elem) {
        const s = SlideNode.toSlidePath(slide);
        return this.moveSlide(elem, s[s.length - 1], false);
    }
    moveSlide(node, to, beforeIt = false) {
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
        }
        else {
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
    removeSlideNode(node) {
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
    removeFullSlide(node) {
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
    setSlideJumpToTarget(node, state) {
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
        const desc = {
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
    static getOrCreateInverse(node, graph) {
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
    static updateInverse(node, graph, inverter) {
        const i = node.inversedBy;
        if (i) {
            // update with the actual values / parameter only
            const c = inverter.call(node, node.requires, node.creates, node.removes);
            i.parameter = c.parameter;
            node.inverter = null;
        }
        else if (!node.isInverse) {
            // create inverse action immediatelly
            graph.createInverse(node, inverter);
            node.inverter = null;
        }
        else {
            node.inverter = inverter;
        }
    }
    static execute(node, graph, withinMilliseconds) {
        const r = node.f.call(node, node.requires, node.parameter, graph, withinMilliseconds);
        return Promise.resolve(r);
    }
}
ProvenanceGraph.PROPAGATED_EVENTS = ['sync', 'add_edge', 'add_node', 'sync_node', 'sync_edge', 'sync_start'];
//# sourceMappingURL=ProvenanceGraph.js.map