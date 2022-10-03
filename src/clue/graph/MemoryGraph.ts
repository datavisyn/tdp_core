import { IPersistable } from '../../base/IPersistable';
import { GraphBase, GraphFactoryUtils, IGraphDump, IGraphFactory } from './GraphBase';
import { GraphEdge, GraphNode, IGraphDataDescription } from './graph';

export class MemoryGraph extends GraphBase implements IPersistable {
  private factory: IGraphFactory;

  constructor(desc: IGraphDataDescription, nodes: GraphNode[] = [], edges: GraphEdge[] = [], factory = GraphFactoryUtils.defaultGraphFactory) {
    super(desc, nodes, edges);
    this.factory = factory;
  }

  restore(persisted: IGraphDump) {
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
