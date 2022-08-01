/// <reference types="jest" />
import { rewriteURLOtherProperty } from '../../../src/clue/base/CLUEGraphManager';

/**
 * A general note for Jest tests with window.location and window.history.
 * Both functions are mocked by JSDOM and work similar to the browser.
 * Only navigating to a page, changing the URL, does not work by
 * using the respective setter.
 *
 * Setting `window.location.search` results in the JSDOM error:
 * > Error: Not implemented: navigation (except hash changes)
 *
 * We prevent this error by using `window.history.pushState()` instead.
 * Here the full URL with search query and hash can be assigned as third
 * function paramater.
 *
 * @see https://github.com/jsdom/jsdom/issues/2112
 */

describe('CLUEGraphManager rewrite URL', () => {
  describe(`from hash to query`, () => {
    it('should rewrite hash to query', () => {
      const clueProperties = 'clue_graph=graph123&clue_state=123';

      window.history.pushState(null, 'Initial URL', `#${clueProperties}`);

      rewriteURLOtherProperty('query'); // = from hash to query

      expect(window.location.hash).toBe(``);
      expect(window.location.search).toBe(`?${clueProperties}`);
    });

    it('should keep remaining hash parameters', () => {
      const clueProperties = 'clue_graph=graph123&clue_state=123';
      const fooProperty = 'foo=bar';

      window.history.pushState(null, 'Initial URL', `#${clueProperties}&${fooProperty}`);

      rewriteURLOtherProperty('query'); // = from hash to query

      expect(window.location.hash).toBe(`#${fooProperty}`);
      expect(window.location.search).toBe(`?${clueProperties}`);
    });

    it('should keep remaining query and hash parameters', () => {
      const clueProperties = 'clue_graph=graph123&clue_state=123';
      const queryProperty = 'foo=bar';
      const hashProperty = 'bar=baz';

      window.history.pushState(null, 'Initial URL', `?${queryProperty}#${clueProperties}&${hashProperty}`);

      rewriteURLOtherProperty('query'); // = from hash to query

      expect(window.location.hash).toBe(`#${hashProperty}`);
      expect(window.location.search).toBe(`?${queryProperty}&${clueProperties}`);
    });

    it('should override existing clue_graph in query', () => {
      const queryProperty = 'clue_graph=graph123';
      const hashProperty = 'clue_graph=graph456';

      window.history.pushState(null, 'Initial URL', `?${queryProperty}#${hashProperty}`);

      expect(window.location.search).toContain(queryProperty);

      rewriteURLOtherProperty('query'); // = from hash to query

      expect(window.location.search).not.toContain(queryProperty);
      expect(window.location.hash).toBe(``);
      expect(window.location.search).toBe(`?${hashProperty}`);
    });
  });

  describe(`from query to hash`, () => {
    it('should rewrite query to hash', () => {
      const clueProperties = 'clue_graph=graph123&clue_state=123';

      window.history.pushState(null, 'Initial URL', `?${clueProperties}`);

      rewriteURLOtherProperty('hash'); // = from query to hash

      expect(window.location.hash).toBe(`#${clueProperties}`);
      expect(window.location.search).toBe(``);
    });

    it('should keep remaining query parameters', () => {
      const clueProperties = 'clue_graph=graph123&clue_state=123';
      const fooProperty = 'foo=bar';

      window.history.pushState(null, 'Initial URL', `?${clueProperties}&${fooProperty}`);

      rewriteURLOtherProperty('hash'); // = from query to hash

      expect(window.location.hash).toBe(`#${clueProperties}`);
      expect(window.location.search).toBe(`?${fooProperty}`);
    });

    it('should keep remaining query and hash parameters', () => {
      const clueProperties = 'clue_graph=graph123&clue_state=123';
      const queryProperty = 'foo=bar';
      const hashProperty = 'bar=baz';

      window.history.pushState(null, 'Initial URL', `?${clueProperties}&${queryProperty}#${hashProperty}`);

      rewriteURLOtherProperty('hash'); // = from query to hash

      expect(window.location.hash).toBe(`#${hashProperty}&${clueProperties}`);
      expect(window.location.search).toBe(`?${queryProperty}`);
    });

    it('should override existing clue_graph in hash', () => {
      const queryProperty = 'clue_graph=graph123';
      const hashProperty = 'clue_graph=graph456';

      window.history.pushState(null, 'Initial URL', `?${queryProperty}#${hashProperty}`);

      expect(window.location.hash).toContain(hashProperty);

      rewriteURLOtherProperty('hash'); // = from query to hash

      expect(window.location.hash).not.toContain(hashProperty);
      expect(window.location.hash).toBe(`#${queryProperty}`);
      expect(window.location.search).toBe(``);
    });
  });
});
