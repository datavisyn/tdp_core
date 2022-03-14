/**
 * @jest-environment jsdom
 */

/// <reference types="jest" />
import { Select3Utils } from '../src/form/elements/Select3';

describe('select3', () => {
  describe('splitEscaped', () => {
    const reg = /[\s;,]+/gm;
    it('single', () => {
      expect(Select3Utils.splitEscaped('abc', reg, false)).toEqual(['abc']);
      expect(Select3Utils.splitEscaped('abc', reg, true)).toEqual(['abc']);
    });
    it('two', () => {
      expect(Select3Utils.splitEscaped('abc def', reg, false)).toEqual(['abc', 'def']);
      expect(Select3Utils.splitEscaped('abc def', reg, true)).toEqual(['abc', 'def']);
      expect(Select3Utils.splitEscaped('abc;def', reg, false)).toEqual(['abc', 'def']);
      expect(Select3Utils.splitEscaped('abc,def', reg, false)).toEqual(['abc', 'def']);
    });
    it('two_escaped', () => {
      expect(Select3Utils.splitEscaped('abc\\ def', reg, false)).toEqual(['abc\\ def']);
      expect(Select3Utils.splitEscaped('abc\\ def', reg, true)).toEqual(['abc def']);
    });
    it('escape_end', () => {
      expect(Select3Utils.splitEscaped('abc\\', reg, false)).toEqual(['abc\\']);
      expect(Select3Utils.splitEscaped('abc\\', reg, true)).toEqual(['abc\\']);
    });
    it('two_drastic', () => {
      expect(Select3Utils.splitEscaped('abc def ', reg, false)).toEqual(['abc', 'def', '']);
      expect(Select3Utils.splitEscaped('abc   def', reg, false)).toEqual(['abc', 'def']);
    });
  });
});
