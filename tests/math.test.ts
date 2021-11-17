/// <reference types="jest" />
import {Statistics} from '../src/base/statistics';

describe('computeStats', () => {
  function expectStats(input: number[], expected: any) {
    describe('stats ' + input, () => {
      const stats = Statistics.computeStats(input);
      it('max', () => expect(stats.max).toEqual(expected.max));
      it('min', () => expect(stats.min).toEqual(expected.min));
      it('sum', () => expect(stats.sum).toEqual(expected.sum));
      it('mean', () => expect(stats.mean).toEqual(expected.mean));
      it('n', () => expect(stats.n).toEqual(expected.n));
    });
  }
  expectStats([1], {min: 1, max: 1, sum: 1, mean: 1, n: 1});
  expectStats([1,1,1], {min: 1, max: 1, sum: 3, mean: 1, n: 3});
  expectStats([1,2,3], {min: 1, max: 3, sum: 6, mean: 2, n: 3});

  // TODO: Add at least one test for math.categoricalHist
  // TODO: Add at least one test for math.hist
  // TODO: Add at least one test for math.rangeHist
  // TODO: Add at least one test for math.wrapHist
});
