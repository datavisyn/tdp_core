import { IDType } from '../idtype';
import { Range } from '../range';
export declare class ResolveUtils {
    static resolveIdToNames(fromIDType: IDType, id: number, toIDType?: IDType | string): Promise<string[][]>;
    /**
     * Maps exactly one _id (numeric id) of the fromIDtype to the first occurrence of the toIDtype
     *
     * @param fromIDType The IDType to map from
     * @param id The current _id
     * @param toIDtype The IDType to map to
     * @returns a Promise to the matching id of the toIDtype
     */
    static resolveId(fromIDType: IDType, id: number, toIDtype?: IDType | string): Promise<string>;
    /**
     * Maps numerous _ids (numeric ids) of the fromIDtype to each first occurrence of the toIDtype
     *
     * @param fromIDType The IDType to map from
     * @param ids The current _ids
     * @param toIDtype The IDType to map to
     * @returns a Promise to the matching id of the toIDtype
     */
    static resolveIds(fromIDType: IDType, ids: Range | number[], toIDType?: IDType | string): Promise<string[]>;
    /**
     * Maps numerous ids (named ids) of the fromIDtype to each first occurrence of the toIDtype
     *
     * @param fromIDType The IDType to map from
     * @param ids The current _ids
     * @param toIDtype The IDType to map to
     * @returns a Promise to the matching id of the toIDtype
     */
    static resolveNames(fromIDType: IDType, ids: Range | number[], toIDType?: IDType | string): Promise<string[]>;
    /**
     * Maps numerous ids (named ids) of the fromIDtype to all occurrence of the toIDtype
     * This can resolve a n:m mapping
     *
     * @param fromIDType The IDType to map from
     * @param ids The current _ids
     * @param toIDtype The IDType to map to
     * @returns a Promise to the matching id of the toIDtype
     */
    static resolveAllNames(fromIDType: IDType, ids: Range | number[], toIDType?: IDType | string): Promise<string[][]>;
    /**
     * Maps numerous _ids (numeric ids) of the fromIDtype to all occurrence of the toIDtype
     * This can resolve a n:m mapping
     *
     * @param fromIDType The IDType to map from
     * @param ids The current _ids
     * @param toIDtype The IDType to map to
     * @returns a Promise to the matching id of the toIDtype
     */
    static resolveAllIds(fromIDType: IDType, ids: Range | number[], toIDType?: IDType | string): Promise<string[][]>;
}
//# sourceMappingURL=ResolveUtils.d.ts.map