import { Selection } from 'd3v3';
import { CLUEGraphManager } from '../base';
import { IProvenanceGraphDataDescription } from '../provenance';
declare abstract class ASessionList {
    private readonly parent;
    protected readonly mode: 'table' | 'list';
    private handler;
    constructor(parent: HTMLElement, graphManager: CLUEGraphManager, mode?: 'table' | 'list');
    destroy(): void;
    protected static createButton(type: 'delete' | 'select' | 'clone' | 'persist' | 'edit'): string;
    protected registerActionListener(manager: CLUEGraphManager, $enter: Selection<IProvenanceGraphDataDescription>): void;
    protected createLoader(): Selection<any>;
    protected abstract build(manager: CLUEGraphManager): Promise<() => any>;
}
/**
 * a table ot the temporary sessions within this application
 */
export declare class TemporarySessionList extends ASessionList {
    static readonly KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES = 10;
    protected getData(manager: CLUEGraphManager): Promise<IProvenanceGraphDataDescription[]>;
    protected build(manager: CLUEGraphManager): Promise<() => Promise<IProvenanceGraphDataDescription[]>>;
}
/**
 * a table ot the persistent sessions within this application
 */
export declare class PersistentSessionList extends ASessionList {
    protected getData(manager: CLUEGraphManager): Promise<IProvenanceGraphDataDescription[]>;
    protected build(manager: CLUEGraphManager): Promise<() => Promise<void>>;
}
export {};
//# sourceMappingURL=SessionList.d.ts.map