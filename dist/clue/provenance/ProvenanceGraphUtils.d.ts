import { ActionNode } from './ActionNode';
import { IObjectRef, ObjectNode } from './ObjectNode';
import type { IGraphFactory } from '../graph/GraphBase';
export declare class ProvenanceGraphUtils {
    private static removeNoops;
    private static compositeCompressor;
    private static createCompressor;
    /**
     * returns a compressed version of the paths where just the last selection operation remains
     * @param path
     */
    static compressGraph(path: ActionNode[]): Promise<ActionNode[]>;
    /**
     * find common element in the list of two elements returning the indices of the first same item
     * @param a
     * @param b
     * @returns {any}
     */
    static findCommon<T>(a: T[], b: T[]): {
        i: number;
        j: number;
    };
    static asFunction(i: any): any;
    private static noop;
    private static createNoop;
    private static createLazyCmdFunctionFactory;
    static provenanceGraphFactory(): IGraphFactory;
    static findMetaObject<T>(find: IObjectRef<T>): (obj: ObjectNode<any>) => boolean;
}
//# sourceMappingURL=ProvenanceGraphUtils.d.ts.map