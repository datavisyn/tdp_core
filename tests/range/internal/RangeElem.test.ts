/// <reference types="jest" />
import {RangeElem} from '../../../src/range/internal/RangeElem';

describe('RangeElem', () => {
  describe('from', () => {
    it('default', () => expect(new RangeElem(0).from).toBe(0));
    it('set value', () => expect(new RangeElem(2).from).toBe(2));
  });
  describe('to', () => {
    it('default', () => expect(new RangeElem(0).to).toBe(-1));
    it('set value', () => expect(new RangeElem(0, 2).to).toBe(2));
  });
  describe('step', () => {
    it('default', () => expect(new RangeElem(0).step).toBe(1));
    it('set value', () => expect(new RangeElem(0, 2, 1).step).toBe(1));
    it('set value', () => expect(new RangeElem(0, 2, 2).step).toBe(2));
  });
  describe('isAll', () => {
    it('default', () => expect(new RangeElem(0).isAll).toBeTruthy());
    it('explicit', () => expect(new RangeElem(0, -1).isAll).toBeTruthy());
    it('explicit full', () => expect(new RangeElem(0, -1, 1).isAll).toBeTruthy());
    it('not', () => expect(new RangeElem(1).isAll).not.toBeTruthy());
    it('not explicit', () => expect(new RangeElem(0, 5).isAll).not.toBeTruthy());
    it('not explicit full', () => expect(new RangeElem(0, -1, 2).isAll).not.toBeTruthy());
  });
  describe('isSingle', () => {
    it('default', () => expect(new RangeElem(0).isSingle).not.toBeTruthy());
    it('all', () => expect(new RangeElem(0, -1).isSingle).not.toBeTruthy());
    it('single 0:1', () => expect(new RangeElem(0, 1).isSingle).toBeTruthy());
    it('single 1:2', () => expect(new RangeElem(1, 2).isSingle).toBeTruthy());
    it('single 4:6:2', () => expect(new RangeElem(4, 6, 2).isSingle).toBeTruthy());
    it('single 6:5:-1', () => expect(new RangeElem(6, 5, -1).isSingle).toBeTruthy());
  });
  describe('isUnbound', () => {
    it('default', () => expect(new RangeElem(0).isUnbound).toBeTruthy());
    it('explicit', () => expect(new RangeElem(0, -1).isUnbound).toBeTruthy());
    it('bound', () => expect(new RangeElem(0, 2).isUnbound).not.toBeTruthy());
    it('unbound negative start', () => expect(new RangeElem(-2, 2).isUnbound).toBeTruthy());
  });

  describe('all', () => {
    const elem = RangeElem.all();
    it('isAll', () => expect(elem.isAll).toBeTruthy());
    it('!isSingle', () => expect(elem.isSingle).not.toBeTruthy());
    it('isUnbound', () => expect(elem.isUnbound).toBeTruthy());
    it('from', () => expect(elem.from).toBe(0));
    it('to', () => expect(elem.to).toBe(-1));
    it('step', () => expect(elem.step).toBe(1));
    it('size', () => expect(elem.size(10)).toBe(10));
  });
  describe('none', () => {
    const elem = RangeElem.none();
    it('!isAll', () => expect(elem.isAll).not.toBeTruthy());
    it('!isSingle', () => expect(elem.isSingle).not.toBeTruthy());
    it('!isUnbound', () => expect(elem.isUnbound).not.toBeTruthy());
    it('from', () => expect(elem.from).toBe(0));
    it('to', () => expect(elem.to).toBe(0));
    it('step', () => expect(elem.step).toBe(1));
    it('size', () => expect(elem.size()).toBe(0));
  });
  describe('single', () => {
    const elem = RangeElem.single(5);
    it('!isAll', () => expect(elem.isAll).not.toBeTruthy());
    it('isSingle', () => expect(elem.isSingle).toBeTruthy());
    it('!isUnbound', () => expect(elem.isUnbound).not.toBeTruthy());
    it('from', () => expect(elem.from).toBe(5));
    it('to', () => expect(elem.to).toBe(6));
    it('step', () => expect(elem.step).toBe(1));
    it('size', () => expect(elem.size()).toBe(1));
  });
  describe('iter', () => {
    it('default 0:5', () => expect(new RangeElem(0, 5).iter().asList()).toEqual([0, 1, 2, 3, 4]));
    it('default 4:-1:-1', () => expect(new RangeElem(4, -1, -1).iter().asList()).toEqual([4, 3, 2, 1, 0]));
    it('default 0:5:2', () => expect(new RangeElem(0, 5, 2).iter().asList()).toEqual([0, 2, 4]));
    it('default 0:-1 (5)', () => expect(new RangeElem(0).iter(5).asList()).toEqual([0, 1, 2, 3, 4]));
    it('default 0:-1 (5)', () => expect(new RangeElem(-2, -1, -1).iter(5).asList()).toEqual([4, 3, 2, 1, 0]));
    it('default -1:4:-1 (10)', () => expect(new RangeElem(-1, 4, -1).iter(10).asList()).toEqual([10, 9, 8, 7, 6, 5]));
  });
  describe('size', () => {
    it('default 0:5', () => expect(new RangeElem(0, 5).size()).toBe(5));
    it('default 4:-1:-1', () => expect(new RangeElem(4, -1, -1).size()).toBe(5));
    it('default 0:5:2', () => expect(new RangeElem(0, 5, 2).size()).toBe(3));
    it('default 0:-1 (5)', () => expect(new RangeElem(0).size(5)).toBe(5));
    it('default -1:4:-1 (10)', () => expect(new RangeElem(-1, 4, -1).size(10)).toBe(6));
  });
  describe('reverse', () => {
    it('0:-1', () => expect(new RangeElem(0).reverse()).toEqual(new RangeElem(-2, -1, -1)));
    it('0:5', () => expect(new RangeElem(0, 5).reverse()).toEqual(new RangeElem(4, -1, -1)));
    it('2:5', () => expect(new RangeElem(2, 5).reverse()).toEqual(new RangeElem(4, 1, -1)));
    it('5:2:-1', () => expect(new RangeElem(5, 2, -1).reverse()).toEqual(new RangeElem(1, 4)));
  });
  describe('invert', () => {
    it('0:-1', () => expect(new RangeElem(0).invert(5)).toBe(5));
    it('0:10', () => expect(new RangeElem(0, 10).invert(5)).toBe(5));
    it('5:20', () => expect(new RangeElem(5, 20).invert(5)).toBe(10));
    it('20:-1:-1', () => expect(new RangeElem(20, -1, -1).invert(5)).toBe(15));
  });
  describe('contains', () => {
    it('0:-1 5', () => expect(new RangeElem(0).contains(5)).toBe(true));
    it('0:5 10', () => expect(new RangeElem(0, 5).contains(10)).not.toBe(true));
    it('0:5 5', () => expect(new RangeElem(0, 5).contains(5)).not.toBe(true));
    it('0:5 -1', () => expect(new RangeElem(0, 5).contains(-1)).not.toBe(true));
    it('0:10:2 2', () => expect(new RangeElem(0, 10, 2).contains(2)).toBe(true));
    it('0:10:2 3', () => expect(new RangeElem(0, 10, 2).contains(3)).not.toBe(true));
    it('10:-1:-1 3', () => expect(new RangeElem(10, -1, -1).contains(3)).toBe(true));
    it('10:-1:-2 2', () => expect(new RangeElem(10, -1, -2).contains(2)).toBe(true));
  });

  describe('parse', () => {
    it('""', () => expect(RangeElem.parse('')).toEqual(RangeElem.all()));
    it('":"', () => expect(RangeElem.parse('::')).toEqual(RangeElem.all()));
    it('"::"', () => expect(RangeElem.parse('::')).toEqual(RangeElem.all()));
    it('"2"', () => expect(RangeElem.parse('2')).toEqual(RangeElem.single(2)));
    it('"2:5"', () => expect(RangeElem.parse('2:5')).toEqual(new RangeElem(2, 5)));
    it('":5"', () => expect(RangeElem.parse(':5')).toEqual(new RangeElem(0, 5)));
    it('"2:5:2"', () => expect(RangeElem.parse('2:5:2')).toEqual(new RangeElem(2, 5, 2)));
    it('"::2"', () => expect(RangeElem.parse('::2')).toEqual(new RangeElem(0, -1, 2)));
    it('"a"', () => expect(RangeElem.parse.bind(RangeElem, 'a')).toThrow());
    it('"0:a"', () => expect(RangeElem.parse.bind(RangeElem, '0:a')).toThrow());
  });
});
