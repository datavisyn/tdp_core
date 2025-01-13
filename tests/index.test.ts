/// <reference types="jest" />
import * as pkg from '../package.json';
import { UniqueIdManager } from '../src/app/UniqueIdManager';
import { ArrayUtils } from '../src/base/ArrayUtils';
import { BaseUtils } from '../src/base/BaseUtils';

describe('argFilter', () => {
  it('evens', () => expect(ArrayUtils.argFilter([1, 3, 5, 2, 4, 6, 7, 9, 11], (d) => d % 2 === 0)).toEqual([3, 4, 5]));
});

describe('argSort', () => {
  it('length', () => expect(ArrayUtils.argSort(['lizard', 'marsupial', 'cat', 'dolphin'], (a, b) => a.length - b.length)).toEqual([2, 0, 3, 1]));
});

describe('mod', () => {
  it('+ % +', () => expect(BaseUtils.mod(101, 5)).toEqual(1));
  it('- % + (native)', () => expect(-101 % 5).toEqual(-1));
  it('- % +', () => expect(BaseUtils.mod(-101, 5)).toEqual(4));
  it('+ % -', () => expect(BaseUtils.mod(101, -5)).toEqual(-4));
  it('- % -', () => expect(BaseUtils.mod(-101, -5)).toEqual(-1));
});

describe('bounds', () => {
  /* TODO: This seems odd. For instance, there is already an x and y provided by the DOM,
  but we give a different meaning to these.  */
  it('not a DOM object', () => expect(BaseUtils.bounds(null)).toEqual({ x: 0, y: 0, w: 0, h: 0 }));
  // TODO: DOM object
});

// regex for sem ver: https://github.com/sindresorhus/semver-regex/blob/master/index.js
it('version is sem ver', () =>
  // eslint-disable-next-line no-useless-escape
  expect(pkg.version).toMatch(/\bv?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?\b/gi));

describe('uniqueId', () => {
  it('first time', () => expect(UniqueIdManager.getInstance().uniqueId()).toEqual(0));
  it('second time', () => expect(UniqueIdManager.getInstance().uniqueId()).toEqual(1));
});

describe('uniqueString', () => {
  it('first time', () => expect(UniqueIdManager.getInstance().uniqueString()).toEqual('_default2'));
  it('second time', () => expect(UniqueIdManager.getInstance().uniqueString()).toEqual('_default3'));
  it('foobar time', () => expect(UniqueIdManager.getInstance().uniqueString('foobar')).toEqual('foobar0'));
});

describe('resolveIn', () => {
  it('200ms', async () => {
    const past = Date.now();
    await BaseUtils.resolveIn(201).then(() => {
      const present = Date.now();
      const actual = present - past;
      expect(actual).toBeGreaterThanOrEqual(200);
    });
  });
});

describe('randomId', () => {
  it('default', () => expect(BaseUtils.randomId()).toMatch(/^[0-9a-z]{8}$/));
  it('short', () => expect(BaseUtils.randomId(1)).toMatch(/^[0-9a-z]$/));
});

// TODO: What is this for?
it('flagId', () => expect(UniqueIdManager.getInstance().flagId('fake', 1)).toEqual(1));

// TODO: Add at least one test for copyDnD
// TODO: Add at least one test for delayedCall
// TODO: Add at least one test for extendClass
// TODO: Add at least one test for fix_id
// TODO: Add at least one test for hasDnDType
// TODO: Add at least one test for hash
// TODO: Add at least one test for mixin
// TODO: Add at least one test for onDOMNodeRemoved
// TODO: Add at least one test for param

// TODO: IdPool is limited to core... make private?
// TODO: _init is limited to core... make private?
// TODO: argFilter is limited to core... make private?

// TODO: argSort is limited to core... make private?
// TODO: callable is defined but unused... delete?

// constantFalse external usages:
// caleydo_d3/link.ts:    canHover: C.constantFalse

// constantTrue external usages:
// caleydo_clue/selection.ts:      filter: C.constantTrue,
// caleydo_d3/databrowser.ts:      filter: C.constantTrue
// caleydo_d3/link.ts:      filter = this.options.filter || C.constantTrue;
// caleydo_d3/link.ts:    filter: C.constantTrue,
// caleydo_d3/link.ts:    idTypeFilter : <(idtype: idtypes.IDType, i: number, dataVis: IDataVis) => boolean>C.constantTrue,
// caleydo_d3/link.ts:    canSelect : C.constantTrue,
// caleydo_d3/selectioninfo.ts:    filterSelectionTypes : <(selectionType: string) => boolean>C.constantTrue
// caleydo_d3/selectioninfo.ts:    filterSelectionTypes : <(selectionType: string) => boolean>C.constantTrue,
// caleydo_d3/selectioninfo.ts:    filter : <(idtype: idtypes.IDType) => boolean>C.constantTrue

// TODO: copyDnD is limited to core... make private?
// TODO: delayedCall is defined but unused... delete?

// extendClass external usages:
// caleydo_d3/d3util.ts:  C.extendClass(VisTechnique, vis.AVisInstance);
// fix_id external usages:
// caleydo_importer/importtable.ts:    id: fix_id(common.name+random_id(2)),
// caleydo_importer/importtable.ts:    id: fix_id(common.name+random_id(3)),

// TODO: flagId is limited to core... make private?

// isFunction external usages:
// caleydo_clue/multiform.ts:  if (C.isFunction((<any>m).switchTo)) {
// caleydo_d3/d3util.ts:    if (C.isFunction(this.init)) {
// caleydo_window/main.ts:    if (C.isFunction(vis_or_factory)) {
// caleydo_window/main.ts:        if (!C.isFunction(vis.locate)) {
// caleydo_window/main.ts:        if (!C.isFunction(vis.locateById)) {

// TODO: isUndefined is defined but unused... delete?
// TODO: noop is limited to core... make private?

// offline external usages:
// caleydo_security_flask/login.ts:  if (!C.offline) {
// caleydo_security_flask/login.ts:  if (!C.offline) {

// TODO: server_json_suffix is limited to core... make private?
// TODO: server_url is limited to core... make private?
// TODO: uniqueId is limited to core... make private?

// uniqueString external usages:
// caleydo_d3/parser.ts:    const id = C.uniqueString('localData');
// caleydo_d3/parser.ts:    const id = C.uniqueString('localData');
// caleydo_d3/parser.ts:    const id = C.uniqueString('localData');

// TODO: version is defined but unused... delete?

// TODO: Add at least one test for main.server_json_suffix
// TODO: Add at least one test for main.server_url
// TODO: Add at least one test for main.updateDropEffect
