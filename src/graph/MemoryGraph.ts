import {IPersistable} from '../base/IPersistable';
import {GraphBase, GraphFactoryUtils} from './GraphBase';
import {GraphEdge, GraphNode, IGraphDataDescription} from './graph';

export class MemoryGraph extends GraphBase implements IPersistable {
  constructor(desc: IGraphDataDescription, nodes: GraphNode[] = [], edges: GraphEdge[] = [], private factory = GraphFactoryUtils.defaultGraphFactory) {
    super(desc, nodes, edges);
  }

  restore(persisted: any) {
    const lookup = new Map<number, GraphNode>();
    persisted.nodes.forEach((p: any) => {
      const n = this.factory.makeNode(p);
      lookup.set(n.id, n);
      this.addNode(n);
    });

    persisted.edges.forEach((p: any) => {
      const n = this.factory.makeEdge(p, lookup.get.bind(lookup));
      this.addEdge(n);
    });
    return this;
  }
}
