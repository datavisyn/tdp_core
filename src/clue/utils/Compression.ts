import LZString from 'lz-string';

export function getCompressedFromStorage<T>(storage: Storage, key: string, defaultValue: T): T {
  try {
    const item = storage.getItem(key);
    if (item === undefined || item === null) {
      return defaultValue;
    }
    try {
      return JSON.parse(LZString.decompressFromUTF16(item));
    } catch (e) {
      // Error decoding the compressed value, falling back to just JSON parsing
    }
    return JSON.parse(item);
  } catch (e) {
    console.error(e);
    return defaultValue;
  }
}

export function setCompressedToStorage<T>(storage: Storage, key: string, data: T): void {
  storage.setItem(key, LZString.compressToUTF16(JSON.stringify(data)));
}
