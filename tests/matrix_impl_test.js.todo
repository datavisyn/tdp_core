define(["require", "exports", 'matrix_impl'], function (require, exports, matrix_impl) {
  exports.test = function(){

    QUnit.module('matrix_impl', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(matrix_impl).sort(), [
          "Matrix",
          "MatrixBase",
          "create"
        ]);
      });

      QUnit.module('Matrix', function() {
        QUnit.test('constructor', function(assert) {
          assert.throws( // TODO
            function() {
              new matrix_impl.Matrix();
            },
            TypeError
          );
        });
      });

      // TODO: Even the error test is not working for me.
      // QUnit.module('MatrixBase', function() {
      //   QUnit.test('constructor', function(assert) {
      //     assert.throws( // TODO
      //       function() {
      //         new matrix_impl.MatrixBase();
      //       },
      //       undefined
      //     );
      //   });
      // });

      /* TODO: Add at least one test for matrix_impl.create
      QUnit.module('create', function() {
        QUnit.test('???', function(assert) {
          assert.equal(matrix_impl.create(), '???');
        });
      })
      */



    });

  }
});
