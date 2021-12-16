define(["require", "exports", 'plugin'], function (require, exports, plugin) {
  exports.test = function(){

    QUnit.module('plugin', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(plugin).sort(), [
          "get",
          "list",
          "load",
          "push",
          "pushAll"
        ]);
      });

      /*
      TODO: "C.registry is undefined" -> Are we not building this correctly?
       */

      /* TODO: Add at least one test for plugin.get
      QUnit.module('get', function() {
        QUnit.test('???', function(assert) {
          assert.equal(plugin.get(), '???');
        });
      })
      */

      /* TODO: Add at least one test for plugin.list
      QUnit.module('list', function() {
        QUnit.test('???', function(assert) {
          assert.equal(plugin.list(), '???');
        });
      })
      */

      /* TODO: Add at least one test for plugin.load
      QUnit.module('load', function() {
        QUnit.test('???', function(assert) {
          assert.equal(plugin.load(), '???');
        });
      })
      */

      /* TODO: Add at least one test for plugin.push
      QUnit.module('push', function() {
        QUnit.test('???', function(assert) {
          assert.equal(plugin.push(), '???');
        });
      })
      */

      /* TODO: Add at least one test for plugin.pushAll
      QUnit.module('pushAll', function() {
        QUnit.test('???', function(assert) {
          assert.equal(plugin.pushAll(), '???');
        });
      })
      */



    });

  }
});
