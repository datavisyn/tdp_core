/// <reference types="jest" />
import {serializeLineUpFilter, restoreRegExp} from '../../../src/lineup/internal/cmds';

// The following tests worked with LineUp v3.
// With LineUp v4 the filter object changed
// describe('Serialize LineUp v3 filter for provenance graph', () => {
//   it('filter as string', () => {
//     expect(serializeRegExp('abc')).toBe('abc');
//     expect(typeof serializeRegExp('abc')).toBe('string');
//   });

//   it('filter as RegExp', () => {
//     expect(serializeRegExp(/abc/gm)).toMatchObject({value: '/abc/gm', isRegExp: true});
//     expect(serializeRegExp(/abc/gm)).not.toMatchObject({value: '/12345/gm', isRegExp: true});
//     expect(serializeRegExp(/abc/gm)).not.toMatchObject({value: '/abc/gm', isRegExp: false});
//   });
// });

describe('Serialize LineUp v4 filter for provenance graph', () => {
  it('filter as string', () => {
    const lineUpFilter = {filter: 'abc', filterMissing: false};

    expect(serializeLineUpFilter(lineUpFilter)).toMatchObject({filter: {value: 'abc', isRegExp: false}, filterMissing: false});
  });

  it('filter as RegExp', () => {
    const lineUpFilter = {filter: /abc/gm, filterMissing: false};

    expect(serializeLineUpFilter(lineUpFilter)).toMatchObject({filter: {value: '/abc/gm', isRegExp: true}, filterMissing: false});
    expect(serializeLineUpFilter(lineUpFilter)).not.toMatchObject({filter: {value: '/12345/gm', isRegExp: true}, filterMissing: false});
    expect(serializeLineUpFilter(lineUpFilter)).not.toMatchObject({filter: {value: '/abc/gm', isRegExp: false}, filterMissing: false});
  });
});

describe('Restore LineUp filter from provenance graph', () => {
  it('filter as string', () => {
    expect(restoreRegExp('abc')).toBe('abc');
    expect(typeof restoreRegExp('abc')).toBe('string');
  });

  it('filter as IRegExpFilter', () => {
    expect(restoreRegExp({value: '/abc/gm', isRegExp: true})).toMatchObject(/abc/gm);
  });
});

