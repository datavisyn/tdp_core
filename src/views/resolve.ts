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

export function resolveId(fromIDType: IDType, id: number, toIDtype: IDType | string = null): Promise<string> {
  const target = toIDtype === null ? fromIDType : resolve(toIDtype);
  if (fromIDType.id === target.id) {
    // same just unmap to name
    return fromIDType.unmap([id]).then((names) => names[0]);
  }

  // assume mappable
  return fromIDType.mapToFirstName([id], target).then((names) => names[0]);
}

export function resolveIds(fromIDType: IDType, ids: Range | number[], toIDType: IDType | string = null): Promise<string[]> {
  const target = toIDType === null ? fromIDType : resolve(toIDType);
  if (fromIDType.id === target.id) {
    // same just unmap to name
    return fromIDType.unmap(ids);
  }
  // assume mappable
  return fromIDType.mapToFirstName(ids, target);
}

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

export function resolveAllIds(fromIDType: IDType, ids: Range | number[], toIDType: IDType | string = null): Promise<string[][]> {
  const target = toIDType === null ? fromIDType : resolve(toIDType);
  if (fromIDType.id === target.id) {
    // same just unmap to name
    return fromIDType.unmap(ids).then((ids) => [ids]);
  }
  // assume mappable
  return fromIDType.mapToName(ids, target);
}
