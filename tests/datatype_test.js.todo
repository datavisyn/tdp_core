define(["require", "exports", 'datatype'], function (require, exports, datatype) {
  exports.test = function(){

    QUnit.module('datatype', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(datatype).sort(), [
          "DataTypeBase",
          "assignData",
          "categorical2partitioning",
          "defineDataType",
          "isDataType",
          "mask",
          "transpose"
        ]);
      });

      /*
      TODO: DataTypeBase is internal? Usage across all projects limited to:
      ./caleydo_core/data.ts:    return cached(desc, Promise.resolve(new datatypes.DataTypeBase(desc)));
      ./caleydo_core/graph.ts:export class GraphProxy extends datatypes.DataTypeBase {
      ./caleydo_core/provenance.ts:export class ProvenanceGraph extends datatypes.DataTypeBase {
      ./caleydo_core/stratification_impl.ts:export class Stratification extends datatypes.DataTypeBase implements def.IStratification {
      ./caleydo_core/vector_impl.ts:export class StratificationVector extends datatypes.DataTypeBase implements stratification.IStratification {
      */

      QUnit.module('DataTypeBase', function() {
        QUnit.test('properties', function(assert) {
          var data_description = {};
          assert.deepEqual(properties(new datatype.DataTypeBase(data_description)), [
            "accumulateEvents",
            "clear",
            "constructor",
            "desc",
            "dim",
            "fillAndSend",
            "fire",
            "fireEvent",
            "fromIdRange",
            "handlers",
            "idView",
            "ids",
            "idtypes",
            "list",
            "numSelectListeners",
            "off",
            "on",
            "persist",
            "propagate",
            "restore",
            "select",
            "selectImpl",
            "selectionCache",
            "selectionListener",
            "selectionListeners",
            "selections",
            "singleSelectionListener",
            "toString"
          ]);
        });

        /*
        TODO: accumulateEvents is internal? Usage across all projects limited to:
        ./caleydo_core/idtype.ts:  private accumulateEvents = -1;
        ./caleydo_core/idtype.ts:      if (this.accumulateEvents < 0 || (++this.accumulateEvents) === total) {
        ./caleydo_core/idtype.ts:    this.accumulateEvents = -1; //reset
        ./caleydo_core/idtype.ts:        this.accumulateEvents = 0;
        ./caleydo_core/idtype.ts:        if (this.accumulateEvents > 0) { //one event has not been fires, so do it manually
        */

        /* TODO: Add at least one test for datatype.accumulateEvents
        QUnit.module('accumulateEvents', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.accumulateEvents(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.clear
        QUnit.module('clear', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.clear(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.constructor
        QUnit.module('constructor', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.constructor(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.desc
        QUnit.module('desc', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.desc(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.dim
        QUnit.module('dim', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.dim(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.fillAndSend
        QUnit.module('fillAndSend', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.fillAndSend(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.fire
        QUnit.module('fire', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.fire(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.fireEvent
        QUnit.module('fireEvent', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.fireEvent(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.fromIdRange
        QUnit.module('fromIdRange', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.fromIdRange(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.handlers
        QUnit.module('handlers', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.handlers(), '???');
          });
        });
        */

        /*
        TODO: idView is internal? Usage across all projects limited to:
        ./caleydo_core/matrix_impl.ts:  idView(idRange:ranges.Range = ranges.all()) : Promise<matrix.IMatrix> {
        ./caleydo_core/stratification.ts:  idView(idRange:ranges.Range = ranges.all()):Promise<IStratification> {
        ./caleydo_core/table_impl.ts:  idView(idRange:ranges.Range = ranges.all()) : Promise<def.ITable> {
        ./caleydo_core/vector_impl.ts:  idView(idRange:ranges.Range = ranges.all()) : Promise<def.IVector> {
        */

        /* TODO: Add at least one test for datatype.idView
        QUnit.module('idView', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.idView(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.ids
        QUnit.module('ids', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.ids(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.idtypes
        QUnit.module('idtypes', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.idtypes(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.list
        QUnit.module('list', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.list(), '???');
          });
        });
        */

        /*
        TODO: numSelectListeners is internal? Usage across all projects limited to:
        ./caleydo_core/idtype.ts:  private numSelectListeners = 0;
        ./caleydo_core/idtype.ts:      this.numSelectListeners++;
        ./caleydo_core/idtype.ts:      if (this.numSelectListeners === 1) {
        ./caleydo_core/idtype.ts:      this.numSelectListeners--;
        ./caleydo_core/idtype.ts:      if (this.numSelectListeners === 0) {
        */


        /* TODO: Add at least one test for datatype.numSelectListeners
        QUnit.module('numSelectListeners', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.numSelectListeners(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.off
        QUnit.module('off', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.off(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.on
        QUnit.module('on', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.on(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.persist
        QUnit.module('persist', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.persist(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.propagate
        QUnit.module('propagate', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.propagate(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.restore
        QUnit.module('restore', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.restore(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.select
        QUnit.module('select', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.select(), '???');
          });
        });
        */

        /*
        TODO: selectImpl is internal? Usage across all projects limited to:
        ./caleydo_core/idtype.ts:    return this.selectImpl(range, op, type);
        ./caleydo_core/idtype.ts:  private selectImpl(range:ranges.Range, op = SelectOperation.SET, type:string = defaultSelectionType) {
        ./caleydo_core/idtype.ts:    return this.selectImpl(ranges.none(), SelectOperation.SET, type);
        ./caleydo_core/idtype.ts:    return this.selectImpl(range, op, type);
        ./caleydo_core/idtype.ts:  private selectImpl(cells:ranges.Range[], op = SelectOperation.SET, type:string = defaultSelectionType) {
        ./caleydo_core/idtype.ts:    return this.selectImpl([], SelectOperation.SET, type);
        ./caleydo_core/idtype.ts:    return this.selectImpl(range, op, type, dim);
        ./caleydo_core/idtype.ts:  private selectImpl(range:ranges.Range, op = SelectOperation.SET, type:string = defaultSelectionType, dim = -1) {
        ./caleydo_core/idtype.ts:    return this.selectImpl(ranges.none(), SelectOperation.SET, type, dim);
        */

        /* TODO: Add at least one test for datatype.selectImpl
        QUnit.module('selectImpl', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.selectImpl(), '???');
          });
        });
        */

        /*
        TODO: selectionCache is internal? Usage across all projects limited to:
        ./caleydo_core/idtype.ts:  private selectionCache = [];
        ./caleydo_core/idtype.ts:      this.selectionCache[index] = {
        ./caleydo_core/idtype.ts:      var entry = this.selectionCache[i];
        ./caleydo_core/idtype.ts:    this.selectionCache = [];
        */

        /* TODO: Add at least one test for datatype.selectionCache
        QUnit.module('selectionCache', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.selectionCache(), '???');
          });
        });
        */

        /*
        TODO: selectionListener is internal? Usage across all projects limited to:
        ./caleydo_core/idtype.ts:  private selectionListener = (event:events.IEvent, type:string, act:ranges.Range, added:ranges.Range, removed:ranges.Range) => {
        ./caleydo_core/idtype.ts:    this.elems.forEach((elem) => elem.on('select', this.selectionListener));
        ./caleydo_core/idtype.ts:    this.elems.forEach((elem) => elem.off('select', this.selectionListener));
        ./caleydo_core/idtype.ts:  private selectionListeners = [];
        ./caleydo_core/idtype.ts:  private selectionListener(idtype:IDType, index:number, total:number) {
        ./caleydo_core/idtype.ts:    const selectionListener = (event:any, type:string, act:ranges.Range, added:ranges.Range, removed:ranges.Range) => {
        ./caleydo_core/idtype.ts:    return selectionListener;
        ./caleydo_core/idtype.ts:          this.selectionListeners.push(this.singleSelectionListener);
        ./caleydo_core/idtype.ts:            const s = this.selectionListener(idtype, i, idt.length);
        ./caleydo_core/idtype.ts:            this.selectionListeners.push(s);
        ./caleydo_core/idtype.ts:        this.idtypes.forEach((idtype, i) => idtype.off('select', this.selectionListeners[i]));
        ./caleydo_core/idtype.ts:        this.selectionListeners = [];
        */

        /* TODO: Add at least one test for datatype.selectionListener
        QUnit.module('selectionListener', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.selectionListener(), '???');
          });
        });
        */

        /*
        TODO: selectionListeners is internal? Usage across all projects limited to:
        ./caleydo_core/idtype.ts:  private selectionListeners = [];
        ./caleydo_core/idtype.ts:          this.selectionListeners.push(this.singleSelectionListener);
        ./caleydo_core/idtype.ts:            this.selectionListeners.push(s);
        ./caleydo_core/idtype.ts:        this.idtypes.forEach((idtype, i) => idtype.off('select', this.selectionListeners[i]));
        ./caleydo_core/idtype.ts:        this.selectionListeners = [];
        */

        /* TODO: Add at least one test for datatype.selectionListeners
        QUnit.module('selectionListeners', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.selectionListeners(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.selections
        QUnit.module('selections', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.selections(), '???');
          });
        });
        */

        /*
        TODO: singleSelectionListener is internal? Usage across all projects limited to:
        ./caleydo_core/idtype.ts:  private singleSelectionListener = (event:any, type:string, act:ranges.Range, added:ranges.Range, removed:ranges.Range) => {
        ./caleydo_core/idtype.ts:          this.selectionListeners.push(this.singleSelectionListener);
        ./caleydo_core/idtype.ts:          idt[0].on('select', this.singleSelectionListener);
        */

        /* TODO: Add at least one test for datatype.singleSelectionListener
        QUnit.module('singleSelectionListener', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.singleSelectionListener(), '???');
          });
        });
        */

        /* TODO: Add at least one test for datatype.toString
        QUnit.module('toString', function() {
          QUnit.test('???', function(assert) {
            assert.equal(datatype.toString(), '???');
          });
        });
        */
      });

      /*
      TODO: assignData is internal? No usage outside datatype.ts
      */

      /* TODO: Add at least one test for datatype.assignData
      QUnit.module('assignData', function() {
        QUnit.test('???', function(assert) {
          assert.equal(datatype.assignData(), '???');
        });
      })
      */

      /*
      TODO: categorical2partitioning is internal? Usage across all projects limited to:
      ./caleydo_core/vector_impl.ts:        return datatypes.categorical2partitioning(d, v.categories.map((d) => typeof d === 'string' ? d : d.name), options);
      */

      /* TODO: Add at least one test for datatype.categorical2partitioning
      QUnit.module('categorical2partitioning', function() {
        QUnit.test('???', function(assert) {
          assert.equal(datatype.categorical2partitioning(), '???');
        });
      })
      */

      /*
      TODO: defineDataType is internal? No usage outside datatype.ts
      */

      /* TODO: Add at least one test for datatype.defineDataType
      QUnit.module('defineDataType', function() {
        QUnit.test('???', function(assert) {
          assert.equal(datatype.defineDataType(), '???');
        });
      })
      */

      /*
      TODO: isDataType is internal? Usage across all projects limited to:
      ./caleydo_core/provenance.ts:  if (datatypes.isDataType(v)) {
      */

      /* TODO: Add at least one test for datatype.isDataType
      QUnit.module('isDataType', function() {
        QUnit.test('???', function(assert) {
          assert.equal(datatype.isDataType(), '???');
        });
      })
      */

      /* TODO: Add at least one test for datatype.mask
      QUnit.module('mask', function() {
        QUnit.test('???', function(assert) {
          assert.equal(datatype.mask(), '???');
        });
      })
      */

      /* TODO: Add at least one test for datatype.transpose
      QUnit.module('transpose', function() {
        QUnit.test('???', function(assert) {
          assert.equal(datatype.transpose(), '???');
        });
      })
      */

    });

  }
});

