import type { ActionNode } from '../provenance/ActionNode';
export declare class Compression {
    /**
     * Removes all ActionNodes from the given path that matches the given function id and key.
     * Only the very last item is kept and all previous ones are removed,
     * independent of intermediate, non-matching items.
     *
     * @param path Array of ActionNodes
     * @param functionId Apply removal only on ActionNodes with the given function id
     * @param toKey Unique key to check the consecutive duplicates
     * @returns A copy of the path which can be mutated in the number of items
     */
    static lastOnly(path: ActionNode[], functionId: string, toKey: (action: ActionNode) => string): ActionNode[];
    /**
     * Remove consecutive items from a path array.
     * The removal is only applied on nodes with the given function id
     * and checks the key with the given key function.
     *
     * @param path Array of ActionNodes
     * @param functionId Apply removal only on ActionNodes with the given function id
     * @param toKey Unique key to check the consecutive duplicates
     * @returns A copy of the path which can be mutated in the number of items
     */
    static lastConsecutive(path: ActionNode[], functionId: string, toKey: (action: ActionNode) => string): ActionNode[];
    static createRemove(path: ActionNode[], createFunctionId: string, removeFunctionId: string): ActionNode[];
}
//# sourceMappingURL=Compression.d.ts.map