import IDType from 'phovea_core/src/idtype/IDType';
import {resolve} from 'phovea_core/src/idtype';
import Range from 'phovea_core/src/range/Range';

export function resolveIdToNames(fromIDType: IDType, id: number, toIDType: IDType | string = null): Promise<string[][]> {
  const target = toIDType === null ? fromIDType : resolve(toIDType);
  if (fromIDType.id === target.id) {
    // same just unmap to name
    return fromIDType.unmap([id]).then((names) => [names]);
  }

  // assume mappable
  return fromIDType.mapToName([id], target).then((names) => names);
}

/**
 * Maps exactly one _id (numeric id) of the fromIDtype to the first occurrence of the toIDtype
 *
 * @param fromIDType The IDType to map from
 * @param id The current _id
 * @param toIDtype The IDType to map to
 * @returns a Promise to the matching id of the toIDtype
 */
export function resolveId(fromIDType: IDType, id: number, toIDtype: IDType | string = null): Promise<string> {
  const target = toIDtype === null ? fromIDType : resolve(toIDtype);
  if (fromIDType.id === target.id) {
    // same just unmap to name
    return fromIDType.unmap([id]).then((names) => names[0]);
  }

  // assume mappable
  return fromIDType.mapToFirstName([id], target).then((names) => names[0]);
}

/**
 * Maps numerous _ids (numeric ids) of the fromIDtype to each first occurrence of the toIDtype
 *
 * @param fromIDType The IDType to map from
 * @param ids The current _ids
 * @param toIDtype The IDType to map to
 * @returns a Promise to the matching id of the toIDtype
 */
export function resolveIds(fromIDType: IDType, ids: Range | number[], toIDType: IDType | string = null): Promise<string[]> {
  const target = toIDType === null ? fromIDType : resolve(toIDType);
  if (fromIDType.id === target.id) {
    // same just unmap to name
    return fromIDType.unmap(ids);
  }
  // assume mappable
  return fromIDType.mapToFirstName(ids, target);
}

/**
 * Maps numerous ids (named ids) of the fromIDtype to each first occurrence of the toIDtype
 *
 * @param fromIDType The IDType to map from
 * @param ids The current _ids
 * @param toIDtype The IDType to map to
 * @returns a Promise to the matching id of the toIDtype
 */
export function resolveNames(fromIDType: IDType, ids: Range | number[], toIDType: IDType | string = null): Promise<string[]> {
  const target = toIDType === null ? fromIDType : resolve(toIDType);
  if (fromIDType.id === target.id) {
    // same just unmap to name
    return fromIDType.unmap(ids);
  }
  // assume mappable
  return fromIDType.unmap(ids).then((names) => {
    return fromIDType.mapNameToFirstName(names, target);
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
export function resolveAllNames(fromIDType: IDType, ids: Range | number[], toIDType: IDType | string = null): Promise<string[][]> {
  const target = toIDType === null ? fromIDType : resolve(toIDType);
  if (fromIDType.id === target.id) {
    // same just unmap to name
    return fromIDType.unmap(ids).then((ids) => [ids]);
  }
  // assume mappable
  return fromIDType.unmap(ids).then((names) => {
    return fromIDType.mapNameToName(names, target);
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
export function resolveAllIds(fromIDType: IDType, ids: Range | number[], toIDType: IDType | string = null): Promise<string[][]> {
  const target = toIDType === null ? fromIDType : resolve(toIDType);
  if (fromIDType.id === target.id) {
    // same just unmap to name
    return fromIDType.unmap(ids).then((ids) => [ids]);
  }
  // assume mappable
  return fromIDType.mapToName(ids, target);
}
