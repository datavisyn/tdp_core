define(["require", "exports", 'vis'], function (require, exports, vis) {
  exports.test = function () {

    QUnit.module('vis', function () {

      QUnit.test('Object.keys', function (assert) {
        assert.deepEqual(Object.keys(vis).sort(), [
          "AVisInstance",
          "assignVis",
          "list"
        ]);
      });

      QUnit.module('AVisInstance', function () {

        QUnit.test('Object.keys', function (assert) {
          assert.deepEqual(Object.keys(new vis.AVisInstance()).sort(), [
            "_built",
            "handlers",
            "id"
          ]);
        });

      });


      QUnit.module('assignVis', function () {

        QUnit.test('no arg', function (assert) {
          assert.throws( // TODO
              function () {
                vis.assignVis();
              },
              TypeError
          );
        });

        QUnit.test('one arg', function (assert) {
          assert.throws( // TODO
              function () {
                vis.assignVis('node');
              },
              TypeError
          );
        });

        QUnit.test('two arg', function (assert) {
          assert.throws( // TODO
              function () {
                vis.assignVis('node', 'vis');
              },
              TypeError
          );
        });

      });


      QUnit.module('list', function () {

        QUnit.test('no arg', function (assert) {
          assert.throws( // TODO
              function () {
                vis.list();
              },
              TypeError
          );
        });

        QUnit.test('one arg', function (assert) {
          assert.throws( // TODO
              function () {
                vis.list('TODO: datatypes.IDataType');
              },
              TypeError
          );
        });

      });

    });

  }
});

