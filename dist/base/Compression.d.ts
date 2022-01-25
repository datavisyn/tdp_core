import { ActionNode } from '../provenance';
export declare class Compression {
    static lastOnly(path: ActionNode[], functionId: string, toKey: (action: ActionNode) => string): ActionNode[];
    static createRemove(path: ActionNode[], createFunctionId: string, removeFunctionId: string): ActionNode[];
}
//# sourceMappingURL=Compression.d.ts.map