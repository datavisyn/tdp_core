/// <reference types="jasmine" />
import cached, {cachedLazy} from '../src/cached';

describe('cached', () => {
  describe('cached', () => {
    it('value', () => {
      expect(cached('test', () => 5)).toBe(5);
      expect(cached('test', () => 10)).toBe(5, 'using cached value');
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
