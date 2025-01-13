import { ActionNode } from './ActionNode';
import { ObjectNode } from './ObjectNode';
import { StateNode } from './StateNode';
import { AttributeContainer, GraphEdge } from '../graph/graph';

export class NodeUtils {
  static findLatestPath(state: StateNode) {
    const path = state.path.slice();
    // compute the first path to the end
    // eslint-disable-next-line no-cond-assign
    while ((state = state.nextState) != null && path.indexOf(state) < 0) {
      path.push(state);
    }
    return path;
  }

  static createdBy<T>(node: ObjectNode<T>) {
    const r = node.incoming.filter(GraphEdge.isGraphType('creates'))[0];
    return r ? <ActionNode>r.source : null;
  }

  static removedBy<T>(node: ObjectNode<T>) {
    const r = node.incoming.filter(GraphEdge.isGraphType('removes'))[0];
    return r ? <ActionNode>r.source : null;
  }

  static requiredBy<T>(node: ObjectNode<T>) {
    return node.incoming.filter(GraphEdge.isGraphType('requires')).map((e) => <ActionNode>e.source);
  }

  static partOf<T>(node: ObjectNode<T>) {
    return node.incoming.filter(GraphEdge.isGraphType('consistsOf')).map((e) => <StateNode>e.source);
  }

  static uses<T>(node: ActionNode): ObjectNode<any>[] {
    return node.outgoing.filter(GraphEdge.isGraphType(/(creates|removes|requires)/)).map((e) => <ObjectNode<any>>e.target);
  }

  static creates<T>(node: ActionNode): ObjectNode<any>[] {
    return node.outgoing.filter(GraphEdge.isGraphType('creates')).map((e) => <ObjectNode<any>>e.target);
  }

  static removes<T>(node: ActionNode): ObjectNode<any>[] {
    return node.outgoing
      .filter(GraphEdge.isGraphType('removes'))
      .sort(AttributeContainer.byIndex)
      .map((e) => <ObjectNode<any>>e.target);
  }

  static requires<T>(node: ActionNode): ObjectNode<any>[] {
    return node.outgoing
      .filter(GraphEdge.isGraphType('requires'))
      .sort(AttributeContainer.byIndex)
      .map((e) => <ObjectNode<any>>e.target);
  }

  static resultsIn(node: ActionNode): StateNode {
    const r = node.outgoing.filter(GraphEdge.isGraphType('resultsIn'))[0];
    return r ? <StateNode>r.target : null;
  }

  static previous(node: ActionNode): StateNode {
    const r = node.incoming.filter(GraphEdge.isGraphType('next'))[0];
    return r ? <StateNode>r.source : null;
  }
}
