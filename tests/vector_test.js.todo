define(["require", "exports", 'vector'], function (require, exports, vector) {
  exports.test = function(){

    QUnit.module('vector', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(vector).sort(), [
          // vector.ts defines an interface, so this is expected,
          //  TODO: but should this namespace even be visible to JS?
        ]);
      });

    });

  }
});
