/// <reference types="jest" />
import { ValueCache } from '../src/base/ValueCache';

describe('cached', () => {
  describe('cached', () => {
    it('value', () => {
      expect(ValueCache.getInstance().cached('test', () => 5)).toBe(5);
      // expect(cached('test', () => 10)).toBe('using cached value');
      expect(ValueCache.getInstance().cached('test', () => 10)).toBe(5);
    });
  });
  describe('cachedLazy', () => {
    it('value', () => {
      expect(typeof ValueCache.getInstance().cachedLazy('testLazy', () => 5)).toBe('function');
      expect(ValueCache.getInstance().cachedLazy('testLazy', () => 5)()).toBe(5);
      expect(ValueCache.getInstance().cachedLazy('testLazy', () => 10)()).toBe(5);
    });
  });
});
