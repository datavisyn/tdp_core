/// <reference types="jest" />
import {Session} from '../src/base/Session';
const session = new Session();


describe('methods', () => {
  const key = 'test-key';
  it('invalid key', () => {
    expect(session.has(key)).toBe(false);
  });
  it('valid key', () => {
    session.store(key, 'foobar');
    expect(session.has(key)).toBe(true);
    expect(session.retrieve(key)).toBe('foobar');
  });
  it('overrite key', () => {
    session.store(key, 'barfoo');
    expect(session.has(key)).toBe(true);
    expect(session.retrieve(key)).toBe('barfoo');
  });
  it('remove key', () => {
    session.remove(key);
    expect(session.has(key)).toBe(false);
  });
});

describe('data types', () => {
  function checkStore(data: any) {
    it(typeof data, () => {
      const key = 'key';
      session.store(key, data);
      expect(session.retrieve(key)).toEqual(data);
    });
  }
  checkStore(1);
  checkStore(['array']);
  checkStore({'hash': true});
});
