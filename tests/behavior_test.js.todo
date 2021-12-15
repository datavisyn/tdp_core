define(["require", "exports", 'behavior'], function (require, exports, behavior) {
  exports.test = function(){

    QUnit.module('behavior', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(behavior).sort(), [
          "ZoomBehavior",
          "ZoomLogic"
        ]);
      });

      QUnit.module('ZoomBehavior', function() {
        QUnit.test('properties', function(assert) {
          document.getElementById('qunit-fixture').innerHTML = '<div id="fake">foo bar</div>';
          var node = document.getElementById('fake');
          var v, meta;
          var zb = new behavior.ZoomBehavior(node, v, meta);
          assert.deepEqual(properties(zb), [
            "constructor",
            "fire",
            "fireEvent",
            "handlers",
            "isFixedAspectRatio",
            "isHeightFixed",
            "isWidthFixed",
            "list",
            "meta",
            "node",
            "off",
            "on",
            "propagate",
            "v",
            "zoom",
            "zoomIn",
            "zoomOut",
            "zoomSet",
            "zoomTo"
          ]);
        });
  
        /* TODO: Add at least one test for behavior.constructor
        QUnit.module('constructor', function() {
          QUnit.test('???', function(assert) {
            assert.equal(behavior.constructor(), '???');
          });
        });
        */
  
        /* TODO: Add at least one test for behavior.fire
        QUnit.module('fire', function() {
          QUnit.test('???', function(assert) {
            assert.equal(behavior.fire(), '???');
          });
        });
        */
  
        /* TODO: Add at least one test for behavior.fireEvent
        QUnit.module('fireEvent', function() {
          QUnit.test('???', function(assert) {
            assert.equal(behavior.fireEvent(), '???');
          });
        });
        */
  
        /* TODO: Add at least one test for behavior.handlers
        QUnit.module('handlers', function() {
          QUnit.test('???', function(assert) {
            assert.equal(behavior.handlers(), '???');
          });
        });
        */
  
        /* TODO: Add at least one test for behavior.isFixedAspectRatio
        QUnit.module('isFixedAspectRatio', function() {
          QUnit.test('???', function(assert) {
            assert.equal(behavior.isFixedAspectRatio(), '???');
          });
        });
        */

        /*
        TODO: isHeightFixed is internal? No usage outside behavior.ts
        */
  
        /* TODO: Add at least one test for behavior.isHeightFixed
        QUnit.module('isHeightFixed', function() {
          QUnit.test('???', function(assert) {
            assert.equal(behavior.isHeightFixed(), '???');
          });
        });
        */

        /*
        TODO: isWidthFixed is internal? No usage outside behavior.ts
        */

        /* TODO: Add at least one test for behavior.isWidthFixed
        QUnit.module('isWidthFixed', function() {
          QUnit.test('???', function(assert) {
            assert.equal(behavior.isWidthFixed(), '???');
          });
        });
        */
  
        /* TODO: Add at least one test for behavior.list
        QUnit.module('list', function() {
          QUnit.test('???', function(assert) {
            assert.equal(behavior.list(), '???');
          });
        });
        */
  
        /* TODO: Add at least one test for behavior.meta
        QUnit.module('meta', function() {
          QUnit.test('???', function(assert) {
            assert.equal(behavior.meta(), '???');
          });
        });
        */
  
        /* TODO: Add at least one test for behavior.node
        QUnit.module('node', function() {
          QUnit.test('???', function(assert) {
            assert.equal(behavior.node(), '???');
          });
        });
        */
  
        /* TODO: Add at least one test for behavior.off
        QUnit.module('off', function() {
          QUnit.test('???', function(assert) {
            assert.equal(behavior.off(), '???');
          });
        });
        */
  
        /* TODO: Add at least one test for behavior.on
        QUnit.module('on', function() {
          QUnit.test('???', function(assert) {
            assert.equal(behavior.on(), '???');
          });
        });
        */
  
        /* TODO: Add at least one test for behavior.propagate
        QUnit.module('propagate', function() {
          QUnit.test('???', function(assert) {
            assert.equal(behavior.propagate(), '???');
          });
        });
        */
  
        /* TODO: Add at least one test for behavior.v
        QUnit.module('v', function() {
          QUnit.test('???', function(assert) {
            assert.equal(behavior.v(), '???');
          });
        });
        */
  
        /* TODO: Add at least one test for behavior.zoom
        QUnit.module('zoom', function() {
          QUnit.test('???', function(assert) {
            assert.equal(behavior.zoom(), '???');
          });
        });
        */

        /*
        TODO: zoomIn is internal? No usage outside behavior.ts
        */

        /* TODO: Add at least one test for behavior.zoomIn
        QUnit.module('zoomIn', function() {
          QUnit.test('???', function(assert) {
            assert.equal(behavior.zoomIn(), '???');
          });
        });
        */

        /*
        TODO: zoomOut is internal? No usage outside behavior.ts
        */

        /* TODO: Add at least one test for behavior.zoomOut
        QUnit.module('zoomOut', function() {
          QUnit.test('???', function(assert) {
            assert.equal(behavior.zoomOut(), '???');
          });
        });
        */

        /*
        TODO: zoomSet is internal? No usage outside behavior.ts
        */
  
        /* TODO: Add at least one test for behavior.zoomSet
        QUnit.module('zoomSet', function() {
          QUnit.test('???', function(assert) {
            assert.equal(behavior.zoomSet(), '???');
          });
        });
        */
  
        /* TODO: Add at least one test for behavior.zoomTo
        QUnit.module('zoomTo', function() {
          QUnit.test('???', function(assert) {
            assert.equal(behavior.zoomTo(), '???');
          });
        });
        */
      });

      QUnit.module('ZoomLogic', function() {
        QUnit.test('properties', function(assert) {
          var v, meta;
          var zl = new behavior.ZoomLogic(v, meta);
          assert.deepEqual(properties(zl), [
            "constructor",
            "fire",
            "fireEvent",
            "handlers",
            "isFixedAspectRatio",
            "isHeightFixed",
            "isWidthFixed",
            "list",
            "meta",
            "off",
            "on",
            "propagate",
            "v",
            "zoom",
            "zoomIn",
            "zoomOut",
            "zoomSet",
            "zoomTo"
          ]);
        });

        /* TODO: Add at least one test for logic.constructor
        QUnit.module('constructor', function() {
          QUnit.test('???', function(assert) {
            assert.equal(logic.constructor(), '???');
          });
        });
        */

        /* TODO: Add at least one test for logic.fire
        QUnit.module('fire', function() {
          QUnit.test('???', function(assert) {
            assert.equal(logic.fire(), '???');
          });
        });
        */

        /* TODO: Add at least one test for logic.fireEvent
        QUnit.module('fireEvent', function() {
          QUnit.test('???', function(assert) {
            assert.equal(logic.fireEvent(), '???');
          });
        });
        */

        /* TODO: Add at least one test for logic.handlers
        QUnit.module('handlers', function() {
          QUnit.test('???', function(assert) {
            assert.equal(logic.handlers(), '???');
          });
        });
        */

        /* TODO: Add at least one test for logic.isFixedAspectRatio
        QUnit.module('isFixedAspectRatio', function() {
          QUnit.test('???', function(assert) {
            assert.equal(logic.isFixedAspectRatio(), '???');
          });
        });
        */

        /* TODO: Add at least one test for logic.isHeightFixed
        QUnit.module('isHeightFixed', function() {
          QUnit.test('???', function(assert) {
            assert.equal(logic.isHeightFixed(), '???');
          });
        });
        */

        /* TODO: Add at least one test for logic.isWidthFixed
        QUnit.module('isWidthFixed', function() {
          QUnit.test('???', function(assert) {
            assert.equal(logic.isWidthFixed(), '???');
          });
        });
        */

        /* TODO: Add at least one test for logic.list
        QUnit.module('list', function() {
          QUnit.test('???', function(assert) {
            assert.equal(logic.list(), '???');
          });
        });
        */

        /* TODO: Add at least one test for logic.meta
        QUnit.module('meta', function() {
          QUnit.test('???', function(assert) {
            assert.equal(logic.meta(), '???');
          });
        });
        */

        /* TODO: Add at least one test for logic.off
        QUnit.module('off', function() {
          QUnit.test('???', function(assert) {
            assert.equal(logic.off(), '???');
          });
        });
        */

        /* TODO: Add at least one test for logic.on
        QUnit.module('on', function() {
          QUnit.test('???', function(assert) {
            assert.equal(logic.on(), '???');
          });
        });
        */

        /* TODO: Add at least one test for logic.propagate
        QUnit.module('propagate', function() {
          QUnit.test('???', function(assert) {
            assert.equal(logic.propagate(), '???');
          });
        });
        */

        /* TODO: Add at least one test for logic.v
        QUnit.module('v', function() {
          QUnit.test('???', function(assert) {
            assert.equal(logic.v(), '???');
          });
        });
        */

        /* TODO: Add at least one test for logic.zoom
        QUnit.module('zoom', function() {
          QUnit.test('???', function(assert) {
            assert.equal(logic.zoom(), '???');
          });
        });
        */

        /* TODO: Add at least one test for logic.zoomIn
        QUnit.module('zoomIn', function() {
          QUnit.test('???', function(assert) {
            assert.equal(logic.zoomIn(), '???');
          });
        });
        */

        /* TODO: Add at least one test for logic.zoomOut
        QUnit.module('zoomOut', function() {
          QUnit.test('???', function(assert) {
            assert.equal(logic.zoomOut(), '???');
          });
        });
        */

        /* TODO: Add at least one test for logic.zoomSet
        QUnit.module('zoomSet', function() {
          QUnit.test('???', function(assert) {
            assert.equal(logic.zoomSet(), '???');
          });
        });
        */

        /* TODO: Add at least one test for logic.zoomTo
        QUnit.module('zoomTo', function() {
          QUnit.test('???', function(assert) {
            assert.equal(logic.zoomTo(), '???');
          });
        });
        */
      });

    });

  }
});
