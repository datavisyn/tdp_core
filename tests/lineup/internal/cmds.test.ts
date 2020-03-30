/// <reference types="jest" />
import {serializeRegExp, restoreRegExp} from '../../../src/lineup/internal/cmds';

describe('Serialize LineUp filter for provenance graph', () => {
  it('filter as string', () => {
    expect(serializeRegExp('abc')).toBe('abc');
    expect(typeof serializeRegExp('abc')).toBe('string');
  });

  // The following tests worked with LineUp v3.
  // With LineUp v4 the filter object changed
  it('filter as RegExp', () => {
    expect(serializeRegExp(/abc/gm)).toMatchObject({value: '/abc/gm', isRegExp: true});
    expect(serializeRegExp(/abc/gm)).not.toMatchObject({value: '/12345/gm', isRegExp: true});
    expect(serializeRegExp(/abc/gm)).not.toMatchObject({value: '/abc/gm', isRegExp: false});
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

