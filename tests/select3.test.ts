/// <reference types="jasmine" />
import {splitEscaped} from '../src/form/elements/Select3';

describe('select3', () => {
  describe('splitEscaped', () => {
    const reg = /[\s;,]+/gm;
    it('single', () => {
      expect(splitEscaped('abc', reg, false)).toEqual(['abc']);
      expect(splitEscaped('abc', reg, true)).toEqual(['abc']);
    });
    it('two', () => {
      expect(splitEscaped('abc def', reg, false)).toEqual(['abc', 'def']);
      expect(splitEscaped('abc def', reg, true)).toEqual(['abc', 'def']);
      expect(splitEscaped('abc;def', reg, false)).toEqual(['abc', 'def']);
      expect(splitEscaped('abc,def', reg, false)).toEqual(['abc', 'def']);
    });
    it('two_escaped', () => {
      expect(splitEscaped('abc\\ def', reg, false)).toEqual(['abc\\ def']);
      expect(splitEscaped('abc\\ def', reg, true)).toEqual(['abc def']);
    });
    it('escape_end', () => {
      expect(splitEscaped('abc\\', reg, false)).toEqual(['abc\\']);
      expect(splitEscaped('abc\\', reg, true)).toEqual(['abc\\']);
    });
    it('two', () => {
      expect(splitEscaped('abc def ', reg, false)).toEqual(['abc', 'def', '']);
      expect(splitEscaped('abc   def', reg, false)).toEqual(['abc', 'def']);
    });
  });
});
