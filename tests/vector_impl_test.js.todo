define(["require", "exports", 'vector_impl'], function (require, exports, vector_impl) {
  exports.test = function(){

    QUnit.module('vector_impl', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(vector_impl).sort(), [
          "StratificationVector",
          "Vector",
          "VectorBase",
          "create",
          "wrap"
        ]);
      });

      /* TODO: Add at least one test for vector_impl.StratificationVector
      QUnit.module('StratificationVector', function() {
        QUnit.test('???', function(assert) {
          assert.equal(vector_impl.StratificationVector(), '???');
        });
      })
      */

      QUnit.module('Vector', function() {
        QUnit.test('TODO: error', function(assert) {
          assert.throws( // TODO
            function () {
              new vector_impl.Vector();
            },
            TypeError
          );
        });
      });

      QUnit.module('VectorBase', function() {
        QUnit.test('Object.keys', function(assert) {
          assert.deepEqual(Object.keys(new vector_impl.VectorBase()).sort(), [
            "_root", // TODO: private?
            "accumulateEvents",
            "handlers",
            "numSelectListeners",
            "selectionCache",
            "selectionListeners",
            "singleSelectionListener"
          ]);
        });
        // TODO: Test behavior
      });

      QUnit.module('create', function() {
        QUnit.test('TODO: error', function(assert) {
          assert.throws( // TODO
            function () {
              vector_impl.create();
            },
            TypeError
          );
        });
      });

      QUnit.module('wrap', function() {
        QUnit.test('TODO: error', function(assert) {
          assert.throws( // TODO
            function () {
              vector_impl.wrap();
            },
            TypeError
          );
        });
      })

    });

  }
});
