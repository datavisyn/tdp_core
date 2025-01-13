import { ActionNode } from './ActionNode';
import { ObjectNode } from './ObjectNode';
import { GraphEdge, GraphNode } from '../graph/graph';

/**
 * a state node is one state in the visual exploration consisting of an action creating it and one or more following ones.
 * In addition, a state is characterized by the set of active object nodes
 */
export class StateNode extends GraphNode {
  constructor(name: string, description = '') {
    super('state');
    super.setAttr('name', name);
    super.setAttr('description', description);
  }

  get name(): string {
    return super.getAttr('name');
  }

  set name(value: string) {
    super.setAttr('name', value);
  }

  get description(): string {
    return super.getAttr('description', '');
  }

  set description(value: string) {
    super.setAttr('description', value);
  }

  static restore(p: any) {
    const r = new StateNode(p.attrs.name);
    return r.restore(p);
  }

  /**
   * this state consists of the following objects
   * @returns {ObjectNode<any>[]}
   */
  get consistsOf(): ObjectNode<any>[] {
    return this.outgoing.filter(GraphEdge.isGraphType('consistsOf')).map((e) => <ObjectNode<any>>e.target);
  }

  /**
   * returns the actions leading to this state
   * @returns {ActionNode[]}
   */
  get resultsFrom(): ActionNode[] {
    return this.incoming.filter(GraphEdge.isGraphType('resultsIn')).map((e) => <ActionNode>e.source);
  }

  /**
   *
   * @returns {any}
   */
  get creator() {
    // results and not a inversed actions
    const from = this.incoming
      .filter(GraphEdge.isGraphType('resultsIn'))
      .map((e) => <ActionNode>e.source)
      .filter((s) => !s.isInverse);
    if (from.length === 0) {
      return null;
    }
    return from[0];
  }

  get next(): ActionNode[] {
    return this.outgoing
      .filter(GraphEdge.isGraphType('next'))
      .map((e) => <ActionNode>e.target)
      .filter((s) => !s.isInverse);
  }

  get previousState(): StateNode {
    const a = this.creator;
    if (a) {
      return StateNode.previous(a);
    }
    return null;
  }

  get previousStates(): StateNode[] {
    return this.resultsFrom.map((n) => StateNode.previous(n));
  }

  get nextStates(): StateNode[] {
    return this.next.map((n) => StateNode.resultsIn(n));
  }

  get nextState(): StateNode {
    const r = this.next[0];
    return r ? StateNode.resultsIn(r) : null;
  }

  get path(): StateNode[] {
    const p = this.previousState;
    const r: StateNode[] = [];
    r.unshift(this);
    if (p) {
      p.pathImpl(r);
    }
    return r;
  }

  private pathImpl(r: StateNode[]) {
    const p = this.previousState;
    r.unshift(this);
    if (p && r.indexOf(p) < 0) {
      // no loop
      // console.log(p.toString() + ' path '+ r.join(','));
      p.pathImpl(r);
    }
  }

  toString() {
    return this.name;
  }

  static resultsIn<T>(node: GraphNode): StateNode {
    const r = node.outgoing.filter(GraphEdge.isGraphType('resultsIn'))[0];
    return r ? <StateNode>r.target : null;
  }

  static previous(node: GraphNode): StateNode {
    const r = node.incoming.filter(GraphEdge.isGraphType('next'))[0];
    return r ? <StateNode>r.source : null;
  }
}
