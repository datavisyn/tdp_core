/// <reference types="jest" />
import cached, {cachedLazy} from '../src/cached';

describe('cached', () => {
  describe('cached', () => {
    it('value', () => {
      expect(cached('test', () => 5)).toBe(5);
      // expect(cached('test', () => 10)).toBe('using cached value');
      expect(cached('test', () => 10)).toBe(5);
    });
  });
  describe('cachedLazy', () => {
    it('value', () => {
      expect(typeof cachedLazy('testLazy', () => 5)).toBe('function');
      expect(cachedLazy('testLazy', () => 5)()).toBe(5);
      expect(cachedLazy('testLazy', () => 10)()).toBe(5);
    });
  });
});
