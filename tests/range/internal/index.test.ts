/// <reference types="jest" />
import {RangeUtils} from '../../../src/range/internal/internal';

describe('fix', () => {
  it('constant', () => expect(RangeUtils.fixRange(1,10)).toBe(1));
  it('constant negative size', () => expect(RangeUtils.fixRange(10,-1)).toBe(10));
  it('constant negative size', () => expect(RangeUtils.fixRange(10,NaN)).toBe(10));
  it('fix -1', () => expect(RangeUtils.fixRange(-1,10)).toBe(10));
  it('fix -2', () => expect(RangeUtils.fixRange(-2,10)).toBe(9));
  it('fix -1 NaN', () => expect(RangeUtils.fixRange(-1, NaN)).toBeNaN());
  it('fix -8', () => expect(RangeUtils.fixRange(-8, 10)).toBe(3));
   // TODO  what should be the defined behavior?
  it('fix -13',()  => expect(RangeUtils.fixRange(-13, 10)).toBe(-2));
});
