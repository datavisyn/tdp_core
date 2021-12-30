define(["require", "exports", 'matrix'], function (require, exports, matrix) {
  exports.test = function(){

    /*
    TODO: IDTYPE_CELL is defined but unused... delete?
    */

    /*
    TODO: IDTYPE_COLUMN is defined but unused... delete?
    */

    /*
    TODO: IDTYPE_ROW is defined but unused... delete?
    */

    QUnit.module('matrix', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(matrix).sort(), [
          "IDTYPE_CELL",
          "IDTYPE_COLUMN",
          "IDTYPE_ROW"
        ]);
      });

      // TODO: Not sure that these are actually a good thing.

      QUnit.module('IDTYPE_CELL', function() {
        QUnit.test('value', function(assert) {
          assert.equal(matrix.IDTYPE_CELL, 2);
        });
      });

      QUnit.module('IDTYPE_COLUMN', function() {
        QUnit.test('value', function(assert) {
          assert.equal(matrix.IDTYPE_COLUMN, 1);
        });
      });

      QUnit.module('IDTYPE_ROW', function() {
        QUnit.test('value', function(assert) {
          assert.equal(matrix.IDTYPE_ROW, 0);
        });
      });

    });

  }
});
