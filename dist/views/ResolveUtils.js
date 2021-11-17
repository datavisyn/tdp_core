import { IDTypeManager } from '../idtype';
export class ResolveUtils {
    static resolveIdToNames(fromIDType, id, toIDType = null) {
        const target = toIDType === null ? fromIDType : IDTypeManager.getInstance().resolveIdType(toIDType);
        if (fromIDType.id === target.id) {
            // same just unmap to name
            return fromIDType.unmap([id]).then((names) => [names]);
        }
        // assume mappable
        return IDTypeManager.getInstance().mapToName(fromIDType, [id], target).then((names) => names);
    }
    /**
     * Maps exactly one _id (numeric id) of the fromIDtype to the first occurrence of the toIDtype
     *
     * @param fromIDType The IDType to map from
     * @param id The current _id
     * @param toIDtype The IDType to map to
     * @returns a Promise to the matching id of the toIDtype
     */
    static resolveId(fromIDType, id, toIDtype = null) {
        const target = toIDtype === null ? fromIDType : IDTypeManager.getInstance().resolveIdType(toIDtype);
        if (fromIDType.id === target.id) {
            // same just unmap to name
            return fromIDType.unmap([id]).then((names) => names[0]);
        }
        // assume mappable
        return IDTypeManager.getInstance().mapToFirstName(fromIDType, [id], target).then((names) => names[0]);
    }
    /**
     * Maps numerous _ids (numeric ids) of the fromIDtype to each first occurrence of the toIDtype
     *
     * @param fromIDType The IDType to map from
     * @param ids The current _ids
     * @param toIDtype The IDType to map to
     * @returns a Promise to the matching id of the toIDtype
     */
    static resolveIds(fromIDType, ids, toIDType = null) {
        const target = toIDType === null ? fromIDType : IDTypeManager.getInstance().resolveIdType(toIDType);
        if (fromIDType.id === target.id) {
            // same just unmap to name
            return fromIDType.unmap(ids);
        }
        // assume mappable
        return IDTypeManager.getInstance().mapToFirstName(fromIDType, ids, target);
    }
    /**
     * Maps numerous ids (named ids) of the fromIDtype to each first occurrence of the toIDtype
     *
     * @param fromIDType The IDType to map from
     * @param ids The current _ids
     * @param toIDtype The IDType to map to
     * @returns a Promise to the matching id of the toIDtype
     */
    static resolveNames(fromIDType, ids, toIDType = null) {
        const target = toIDType === null ? fromIDType : IDTypeManager.getInstance().resolveIdType(toIDType);
        if (fromIDType.id === target.id) {
            // same just unmap to name
            return fromIDType.unmap(ids);
        }
        // assume mappable
        return fromIDType.unmap(ids).then((names) => {
            return IDTypeManager.getInstance().mapNameToFirstName(fromIDType, names, target);
        });
    }
    /**
     * Maps numerous ids (named ids) of the fromIDtype to all occurrence of the toIDtype
     * This can resolve a n:m mapping
     *
     * @param fromIDType The IDType to map from
     * @param ids The current _ids
     * @param toIDtype The IDType to map to
     * @returns a Promise to the matching id of the toIDtype
     */
    static resolveAllNames(fromIDType, ids, toIDType = null) {
        const target = toIDType === null ? fromIDType : IDTypeManager.getInstance().resolveIdType(toIDType);
        if (fromIDType.id === target.id) {
            // same just unmap to name
            return fromIDType.unmap(ids).then((ids) => [ids]);
        }
        // assume mappable
        return fromIDType.unmap(ids).then((names) => {
            return IDTypeManager.getInstance().mapNameToName(fromIDType, names, target);
        });
    }
    /**
     * Maps numerous _ids (numeric ids) of the fromIDtype to all occurrence of the toIDtype
     * This can resolve a n:m mapping
     *
     * @param fromIDType The IDType to map from
     * @param ids The current _ids
     * @param toIDtype The IDType to map to
     * @returns a Promise to the matching id of the toIDtype
     */
    static resolveAllIds(fromIDType, ids, toIDType = null) {
        const target = toIDType === null ? fromIDType : IDTypeManager.getInstance().resolveIdType(toIDType);
        if (fromIDType.id === target.id) {
            // same just unmap to name
            return fromIDType.unmap(ids).then((ids) => [ids]);
        }
        // assume mappable
        return IDTypeManager.getInstance().mapToName(fromIDType, ids, target);
    }
}
//# sourceMappingURL=ResolveUtils.js.map