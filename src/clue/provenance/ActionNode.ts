import { GraphNode, AttributeContainer, GraphEdge } from '../graph/graph';
import { ObjectNode, IObjectRef } from './ObjectNode';
import { ICmdFunction, IInverseActionCreator, ICmdFunctionFactory, IAction } from './ICmd';
import { ActionMetaData } from './ActionMeta';

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
  static action(meta: ActionMetaData, id: string, f: ICmdFunction, inputs: IObjectRef<any>[] = [], parameter: any = {}): IAction {
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
  public inverter: IInverseActionCreator;

  constructor(
    meta: ActionMetaData,
    functionId: string,
    public f: ICmdFunction,
    parameter: any = {},
  ) {
    super('action');
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

  get meta(): ActionMetaData {
    return super.getAttr('meta');
  }

  get f_id(): string {
    return super.getAttr('f_id');
  }

  get parameter(): any {
    return super.getAttr('parameter');
  }

  set parameter(value: any) {
    super.setAttr('parameter', value);
  }

  get onceExecuted(): boolean {
    return super.getAttr('onceExecuted', false);
  }

  set onceExecuted(value: boolean) {
    if (this.onceExecuted !== value) {
      super.setAttr('onceExecuted', value);
    }
  }

  static restore(r: any, factory: ICmdFunctionFactory) {
    const a = new ActionNode(ActionMetaData.restore(r.attrs.meta), r.attrs.f_id, factory(r.attrs.f_id), r.attrs.parameter);
    return a.restore(r);
  }

  toString() {
    return this.meta.name;
  }

  get inversedBy() {
    const r = this.incoming.filter(GraphEdge.isGraphType('inverses'))[0];
    return r ? <ActionNode>r.source : null;
  }

  /**
   * inverses another action
   * @returns {ActionNode}
   */
  get inverses() {
    const r = this.outgoing.filter(GraphEdge.isGraphType('inverses'))[0];
    return r ? <ActionNode>r.target : null;
  }

  get isInverse() {
    return this.outgoing.filter(GraphEdge.isGraphType('inverses'))[0] != null;
  }

  equals(that: ActionNode): boolean {
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

  get uses(): ObjectNode<any>[] {
    return this.outgoing.filter(GraphEdge.isGraphType(/(creates|removes|requires)/)).map((e) => <ObjectNode<any>>e.target);
  }

  get creates(): ObjectNode<any>[] {
    return this.outgoing.filter(GraphEdge.isGraphType('creates')).map((e) => <ObjectNode<any>>e.target);
  }

  get removes(): ObjectNode<any>[] {
    return this.outgoing
      .filter(GraphEdge.isGraphType('removes'))
      .sort(AttributeContainer.byIndex)
      .map((e) => <ObjectNode<any>>e.target);
  }

  get requires(): ObjectNode<any>[] {
    return this.outgoing
      .filter(GraphEdge.isGraphType('requires'))
      .sort(AttributeContainer.byIndex)
      .map((e) => <ObjectNode<any>>e.target);
  }
}

/**
 * an action compressor is used to compress a series of action to fewer one, e.g. create and remove can be annihilated
 */
export interface IActionCompressor {
  (path: ActionNode[]): ActionNode[];
}
