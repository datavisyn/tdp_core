import { ActionMetaData } from './ActionMeta';
import { AttributeContainer, GraphEdge, GraphNode } from '../graph/graph';
export class ActionUtils {
    /**
     * creates an action given the data
     * @param meta
     * @param id
     * @param f
     * @param inputs
     * @param parameter
     * @returns {{meta: ActionMetaData, id: string, f: (function(IObjectRef<any>[], any, ProvenanceGraph): ICmdResult), inputs: IObjectRef<any>[], parameter: any}}
     */
    static action(meta, id, f, inputs = [], parameter = {}) {
        return {
            meta,
            id,
            f,
            inputs,
            parameter,
        };
    }
}
export class ActionNode extends GraphNode {
    constructor(meta, functionId, f, parameter = {}) {
        super('action');
        this.f = f;
        super.setAttr('meta', meta);
        super.setAttr('f_id', functionId);
        super.setAttr('parameter', parameter);
    }
    clone() {
        return new ActionNode(this.meta, this.f_id, this.f, this.parameter);
    }
    get name() {
        return this.meta.name;
    }
    get meta() {
        return super.getAttr('meta');
    }
    get f_id() {
        return super.getAttr('f_id');
    }
    get parameter() {
        return super.getAttr('parameter');
    }
    set parameter(value) {
        super.setAttr('parameter', value);
    }
    get onceExecuted() {
        return super.getAttr('onceExecuted', false);
    }
    set onceExecuted(value) {
        if (this.onceExecuted !== value) {
            super.setAttr('onceExecuted', value);
        }
    }
    static restore(r, factory) {
        const a = new ActionNode(ActionMetaData.restore(r.attrs.meta), r.attrs.f_id, factory(r.attrs.f_id), r.attrs.parameter);
        return a.restore(r);
    }
    toString() {
        return this.meta.name;
    }
    get inversedBy() {
        const r = this.incoming.filter(GraphEdge.isGraphType('inverses'))[0];
        return r ? r.source : null;
    }
    /**
     * inverses another action
     * @returns {ActionNode}
     */
    get inverses() {
        const r = this.outgoing.filter(GraphEdge.isGraphType('inverses'))[0];
        return r ? r.target : null;
    }
    get isInverse() {
        return this.outgoing.filter(GraphEdge.isGraphType('inverses'))[0] != null;
    }
    equals(that) {
        // TODO: check if the last comparison makes sense
        // eslint-disable-next-line no-self-compare
        if (!(this.meta.category === that.meta.category && that.meta.operation === that.meta.operation)) {
            return false;
        }
        if (this.f_id !== that.f_id) {
            return false;
        }
        // TODO check parameters if they are the same
        return true;
    }
    get uses() {
        return this.outgoing.filter(GraphEdge.isGraphType(/(creates|removes|requires)/)).map((e) => e.target);
    }
    get creates() {
        return this.outgoing.filter(GraphEdge.isGraphType('creates')).map((e) => e.target);
    }
    get removes() {
        return this.outgoing
            .filter(GraphEdge.isGraphType('removes'))
            .sort(AttributeContainer.byIndex)
            .map((e) => e.target);
    }
    get requires() {
        return this.outgoing
            .filter(GraphEdge.isGraphType('requires'))
            .sort(AttributeContainer.byIndex)
            .map((e) => e.target);
    }
}
//# sourceMappingURL=ActionNode.js.map