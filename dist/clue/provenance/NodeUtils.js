import { AttributeContainer, GraphEdge } from '../graph/graph';
export class NodeUtils {
    static findLatestPath(state) {
        const path = state.path.slice();
        // compute the first path to the end
        // eslint-disable-next-line no-cond-assign
        while ((state = state.nextState) != null && path.indexOf(state) < 0) {
            path.push(state);
        }
        return path;
    }
    static createdBy(node) {
        const r = node.incoming.filter(GraphEdge.isGraphType('creates'))[0];
        return r ? r.source : null;
    }
    static removedBy(node) {
        const r = node.incoming.filter(GraphEdge.isGraphType('removes'))[0];
        return r ? r.source : null;
    }
    static requiredBy(node) {
        return node.incoming.filter(GraphEdge.isGraphType('requires')).map((e) => e.source);
    }
    static partOf(node) {
        return node.incoming.filter(GraphEdge.isGraphType('consistsOf')).map((e) => e.source);
    }
    static uses(node) {
        return node.outgoing.filter(GraphEdge.isGraphType(/(creates|removes|requires)/)).map((e) => e.target);
    }
    static creates(node) {
        return node.outgoing.filter(GraphEdge.isGraphType('creates')).map((e) => e.target);
    }
    static removes(node) {
        return node.outgoing
            .filter(GraphEdge.isGraphType('removes'))
            .sort(AttributeContainer.byIndex)
            .map((e) => e.target);
    }
    static requires(node) {
        return node.outgoing
            .filter(GraphEdge.isGraphType('requires'))
            .sort(AttributeContainer.byIndex)
            .map((e) => e.target);
    }
    static resultsIn(node) {
        const r = node.outgoing.filter(GraphEdge.isGraphType('resultsIn'))[0];
        return r ? r.target : null;
    }
    static previous(node) {
        const r = node.incoming.filter(GraphEdge.isGraphType('next'))[0];
        return r ? r.source : null;
    }
}
//# sourceMappingURL=NodeUtils.js.map