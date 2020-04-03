/// <reference types="jest" />
import {serializeLineUpFilter, restoreLineUpFilter, isSerializedFilter, isLineUpStringFilter, restoreRegExp} from '../../../../src/lineup/internal/cmds/filter';

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

describe('Type guard isLineUpStringFilter', () => {
  it('isLineUpStringFilter with string', () => {
    expect(isLineUpStringFilter({filter: 'abc', filterMissing: false})).toBe(true);
  });

  it('isLineUpStringFilter with string[]', () => {
    expect(isLineUpStringFilter({filter: ['abc', 'def'], filterMissing: false})).toBe(true);
  });

  it('isLineUpStringFilter with null', () => {
    expect(isLineUpStringFilter({filter: null, filterMissing: false})).toBe(true);
  });

  it('isLineUpStringFilter with RegExp', () => {
    expect(isLineUpStringFilter({filter: /abc/gm, filterMissing: false})).toBe(true);
  });
});

describe('Type guard isSerializedFilter', () => {
  it('isSerializedFilter with string', () => {
    expect(isSerializedFilter({filter: {value: 'abc', isRegExp: false}, filterMissing: false})).toBe(true);
  });

  it('isSerializedFilter with string[]', () => {
    expect(isSerializedFilter({filter: {value: ['abc', 'def'], isRegExp: false}, filterMissing: false})).toBe(true);
  });

  it('isSerializedFilter with null', () => {
    expect(isSerializedFilter({filter: {value: null, isRegExp: false}, filterMissing: false})).toBe(true);
  });

  it('isSerializedFilter with RegExp', () => {
    expect(isSerializedFilter({filter: {value: '/abc/gm', isRegExp: true}, filterMissing: false})).toBe(true);
  });
});

describe('Restore RegExp from string', () => {
  it('valid RegExp string', () => {
    expect(restoreRegExp('/abc/gm').toString()).toBe('/abc/gm');
    expect(restoreRegExp('/def/gm').toString()).not.toBe('/abc/gm');
  });

  it('invalid RegExp string', () => {
    expect(() => {
      restoreRegExp('invalid regexp string').toString();
    }).toThrow(new Error('Unable to parse regular expression from string. The string does not seem to be a valid RegExp.'));
  });
});

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

  it('filter as array', () => {
    const lineUpFilter = {filter: ['chromosome', 'gender'], filterMissing: false};
    expect(serializeLineUpFilter(lineUpFilter)).toMatchObject({filter: {value: ['chromosome', 'gender'], isRegExp: false}, filterMissing: false});
  });

  it('filter as null and use regular expression true', () => {
    const lineUpFilter = {filter: null, filterMissing: true};
    expect(serializeLineUpFilter(lineUpFilter)).toMatchObject({filter: {value: null, isRegExp: false}, filterMissing: true});
  });
});


describe('Restore LineUp filter from provenance graph', () => {
  it('filter as string', () => {
    expect(restoreLineUpFilter('abc')).toMatchObject({filter: 'abc', filterMissing: false});
    expect(restoreLineUpFilter('abc').hasOwnProperty('filterMissing')).toBeTruthy();
  });

  it('filter as null and `filterMissing: true`', () => {
    const fromGraphFilter = {filter: {value: null, isRegExp: false}, filterMissing: true};
    expect(restoreLineUpFilter(fromGraphFilter)).toMatchObject({filter: null, filterMissing: true});
  });

  it('filter as IRegExpFilter with `value: abc`, `isRegexp: false`', () => {
    expect(restoreLineUpFilter({value: 'abc', isRegExp: false})).toMatchObject({filter: 'abc', filterMissing: false});
  });

  it('filter as IRegExpFilter with `value: null`, `isRegexp: false`', () => {
    expect(restoreLineUpFilter({value: null, isRegExp: false})).toMatchObject({filter: null, filterMissing: false});
  });

  it('filter as IRegExpFilter with `value: /^abc/gm`, `isRegexp: true`', () => {
    expect(restoreLineUpFilter({value: '/^abc/gm', isRegExp: true})).toMatchObject({filter: /^abc/gm, filterMissing: false});
  });

  it('filter as ISerializableLineUpFilter', () => {
    const fromGraphFilter = {filter: {value: '/abc$/gm', isRegExp: true}, filterMissing: false};
    expect(restoreLineUpFilter(fromGraphFilter)).toMatchObject({filter: /abc$/gm, filterMissing: false});
  });

  it('filter as ISerializableLineUpFilter with property `filterMissing: true`', () => {
    const fromGraphFilter = {filter: {value: '/abc$/gm', isRegExp: true}, filterMissing: true};
    expect(restoreLineUpFilter(fromGraphFilter)).toMatchObject({filter: /abc$/gm, filterMissing: true});
  });

  it('filter as ISerializableLineUpFilter with property `value: null`', () => {
    const fromGraphFilter = {filter: {value: null, isRegExp: false}, filterMissing: true};
    expect(restoreLineUpFilter(fromGraphFilter)).toMatchObject({filter: null, filterMissing: true});
  });

  it('unknown filter format throws error', () => {
    expect(() => {
      restoreLineUpFilter(<any>123456789); // typecast to pass unknown format
    }).toThrowError(new Error('Unknown LineUp filter format. Unable to restore the given filter.'));
  });
});

