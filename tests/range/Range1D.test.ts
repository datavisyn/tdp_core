/// <reference types="jest" />
import { Range1D } from '../../src/range/Range1D';

describe('Range1D', () => {
  describe('all', () => {
    const elem = Range1D.all();
    it('isAll', () => expect(elem.isAll).toBeTruthy());
    it('isUnbound', () => expect(elem.isUnbound).toBeTruthy());
    it('size', () => expect(elem.size(10)).toBe(10));
    it('length', () => expect(elem.length).toBeNaN());
  });
  describe('none', () => {
    const elem = Range1D.none();
    it('!isAll', () => expect(elem.isAll).not.toBeTruthy());
    it('!isUnbound', () => expect(elem.isUnbound).not.toBeTruthy());
    it('size', () => expect(elem.size()).toBe(0));
    it('length', () => expect(elem.length).toBe(0));
  });
  describe('single', () => {
    const elem = Range1D.single(5);
    it('!isAll', () => expect(elem.isAll).not.toBeTruthy());
    it('!isUnbound', () => expect(elem.isUnbound).not.toBeTruthy());
    it('size', () => expect(elem.size()).toBe(1));
    it('length', () => expect(elem.length).toBe(1));
  });
  describe('from', () => {
    const elem = Range1D.from([1, 2, 3]);
    it('!isAll', () => expect(elem.isAll).not.toBeTruthy());
    it('!isUnbound', () => expect(elem.isUnbound).not.toBeTruthy());
    it('size', () => expect(elem.size()).toBe(3));
    it('length', () => expect(elem.length).toBe(3));
  });
  describe('compress', () => {
    it('1,2,3', () => expect(Range1D.from([1, 2, 3]).toString()).toBe('(1:4)'));
    it('1,2,3,6', () => expect(Range1D.from([1, 2, 3, 6]).toString()).toBe('(1:4,6)'));
    // TODO why not allowed anymore?
    // it('1,2,3,9,8,7', () => expect(Range1D.from([1,2,3,9,8,7]).toString()).toBe('(1:4,9:6:-1)'));
    it('1,2,3,9,8,7', () => expect(Range1D.from([1, 2, 3, 9, 8, 7]).toString()).toBe('(1:4,9,8,7)'));
  });
});
