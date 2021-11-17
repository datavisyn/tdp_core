define(["require", "exports", 'event'], function (require, exports, event) {
  exports.test = function(){

    QUnit.module('event', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(event).sort(), [
          "EventHandler",
          "fire",
          "list",
          "off",
          "on"
        ]);
      });

      QUnit.module('EventHandler', function() {
        QUnit.test('properties', function(assert) {
          var type, args, target, delegateTarget;
          assert.deepEqual(properties(new event.EventHandler(type, args, target, delegateTarget)), [
            "fire",
            "fireEvent",
            "handlers",
            "list",
            "off",
            "on",
            "propagate"
          ]);
        });

        /* TODO: Add at least one test for eventHandler.fireEvent
        QUnit.module('fireEvent', function() {
          QUnit.test('???', function(assert) {
            assert.equal(eventHandler.fireEvent(), '???');
          });
        })
        */

        /* TODO: Add at least one test for eventHandler.handlers
        QUnit.module('handlers', function() {
          QUnit.test('???', function(assert) {
            assert.equal(eventHandler.handlers(), '???');
          });
        })
        */

        /* TODO: Add at least one test for eventHandler.propagate
        QUnit.module('propagate', function() {
          QUnit.test('???', function(assert) {
            assert.equal(eventHandler.propagate(), '???');
          });
        })
        */
      });

      /* TODO: Add at least one test for event.fire
      QUnit.module('fire', function() {
        QUnit.test('???', function(assert) {
          assert.equal(event.fire(), '???');
        });
      })
      */

      /* TODO: Add at least one test for event.list
      QUnit.module('list', function() {
        QUnit.test('???', function(assert) {
          assert.equal(event.list(), '???');
        });
      })
      */

      /* TODO: Add at least one test for event.off
      QUnit.module('off', function() {
        QUnit.test('???', function(assert) {
          assert.equal(event.off(), '???');
        });
      })
      */

      /* TODO: Add at least one test for event.on
      QUnit.module('on', function() {
        QUnit.test('???', function(assert) {
          assert.equal(event.on(), '???');
        });
      })
      */

    });

  }
});

