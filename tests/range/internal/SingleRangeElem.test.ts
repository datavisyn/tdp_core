/// <reference types="jest" />
import {SingleRangeElem} from '../../../src/range/internal/SingleRangeElem';

describe('SingleRangeElem', () => {
  const VALUE = 5;
  const v = new SingleRangeElem(VALUE);
  describe('attributes', () => {
    it('from', () => expect(v.from).toBe(VALUE));
    it('to', () => expect(v.to).toBe(VALUE + 1));
    it('step', () => expect(v.step).toBe(1));
    it('!isAll', () => expect(v.isAll).not.toBeTruthy());
    it('isSingle', () => expect(v.isSingle).toBeTruthy());
    it('!isUnbound', () => expect(v.isUnbound).not.toBeTruthy());
    it('toString', () => expect(v.toString()).toBe(String(VALUE)));
  });

  describe('size', () => {
    it('size', () => expect(v.size()).toBe(1));
    it('size(5)', () => expect(v.size(100)).toBe(1));
  });

  describe('clone and reverse', () => {
    it('clone', () => expect(v.clone()).toEqual(v));
    it('reverse', () => expect(v.clone()).toEqual(v));
  });

  describe('iter', () => {
    it('default', () => expect(v.iter().asList()).toEqual([VALUE]));
    it('dedicated size', () => expect(v.iter(100).asList()).toEqual([VALUE]));
  });

  describe('contains', () => {
    it('contains value', () => expect(v.contains(VALUE)).toBeTruthy());
    it('!contains value', () => expect(v.contains(VALUE - 5)).not.toBeTruthy());
  });

  describe('invert', () => {
    it('invert 0', () => expect(v.invert(0)).toBe(VALUE));
    it('invert 2', () => expect(v.invert(2)).toBe(2 + VALUE));
  });
});
