/// <reference types="jest" />
import { Ajax, AppContext } from 'visyn_core/base';

describe('api2absURL', () => {
  it('one arg', () => expect(AppContext.getInstance().api2absURL('/path')).toEqual(`${AppContext.context || '/'}api/path`));
  it('empty query', () => expect(AppContext.getInstance().api2absURL('/path', {})).toEqual(`${AppContext.context || '/'}api/path`));
  it('query', () => expect(AppContext.getInstance().api2absURL('/path', { foo: 'bar' })).toEqual(`${AppContext.context || '/'}api/path?foo=bar`));
  it('url w/ query', () =>
    expect(AppContext.getInstance().api2absURL('/path?query=fake', { foo: 'bar' })).toEqual(`${AppContext.context || '/'}api/path?query=fake&foo=bar`));
});

describe('encodeParams', () => {
  it('null', () => expect(Ajax.encodeParams(null)).toEqual(null));
  it('empty array', () => expect(Ajax.encodeParams([])).toEqual(null));
  it('full array', () => expect(Ajax.encodeParams(['99% & \\', '\u2603', '2+2', 4])).toEqual('0=99%25+%26+%5C&1=%E2%98%83&2=2%2B2&3=4'));
  it('hash', () => expect(Ajax.encodeParams({ foo: 'bar' })).toEqual('foo=bar'));
  it('hash of array', () => expect(Ajax.encodeParams({ foo: ['b', 'a', 'r'] })).toEqual('foo%5B%5D=b&foo%5B%5D=a&foo%5B%5D=r'));
  it('hash of hash', () => expect(Ajax.encodeParams({ foo: [{ nested: true }, 'bar'] })).toEqual('foo%5B0%5D%5Bnested%5D=true&foo%5B%5D=bar'));
});

/* TODO: Add at least one test for ajax.getAPIData */

/* TODO: Add at least one test for ajax.getAPIJSON */

/* TODO: Add at least one test for ajax.getData */

/* TODO: Add at least one test for ajax.getJSON */

/* TODO: Add at least one test for ajax.send */
