/// <reference types="jest" />
import {Matomo} from '../src/app/Matomo';

describe('index', () => {
  it('trackLogin() exists', () => {
    expect(typeof Matomo.trackLogin).toBe('function');
  });

  it('trackLogout() exists', () => {
    expect(typeof Matomo.trackLogout).toBe('function');
  });

  it('trackProvenance() exists', () => {
    expect(typeof Matomo.trackProvenance).toBe('function');
  });
});
