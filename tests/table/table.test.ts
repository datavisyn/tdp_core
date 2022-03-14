/**
 * @jest-environment jsdom
 */

import { ITable, Table } from '../../src/table';
import { IDTypeManager } from '../../src/idtype';

/// <reference types="jest" />

const data = [
  { a: 1, b: 'row1', c: 5.2 },
  { a: 2, b: 'row2', c: 10.2 },
  { a: 3, b: 'row3', c: 2.2 },
  { a: 4, b: 'row4', c: 1.2 },
];

describe('table test', () => {
  let table: ITable;

  beforeEach(() => {
    table = Table.asTable(data);
  });

  describe('original', () => {
    it('base', () => {
      expect(table.ncol).toBe(3);
      expect(table.nrow).toBe(4);
      expect(table.dim).toEqual([4, 3]);
      expect(table.idtype.id).toBe('_rows');
      expect(table.idtypes).toEqual([IDTypeManager.getInstance().resolveIdType('_rows')]);
    });
    it('at', async () => {
      expect(await table.at(0, 0)).toBe(1);
      expect(await table.at(1, 0)).toBe(2);
      expect(await table.at(1, 1)).toBe('row2');
      expect(await table.at(4, 0)).toBeUndefined();
    });
    it('cols', () => {
      expect(table.cols().length).toBe(3);
      expect(table.cols([0, 1]).length).toBe(2);
      expect(table.cols([0, 2]).length).toBe(2);
    });
    it('col', async () => {
      expect(table.col(0).valuetype.type).toBe('real');
      expect(table.col(0).length).toBe(4);
      expect(await table.col(0).data()).toEqual([1, 2, 3, 4]);
      expect(table.col(1).valuetype.type).toBe('categorical');
      expect(table.col(1).length).toBe(4);
      expect(await table.col(1).data()).toEqual(['row1', 'row2', 'row3', 'row4']);
      expect(table.col(2).valuetype.type).toBe('real');
      expect(table.col(2).length).toBe(4);
      expect(await table.col(2).data()).toEqual([5.2, 10.2, 2.2, 1.2]);
      expect(table.col(3)).toBeUndefined();
    });
    it('data', async () => {
      const d = await table.data();
      expect(d.length).toBe(4);
      expect(d[0]).toEqual([1, 'row1', 5.2]);
    });
    it('objects', async () => {
      const d = await table.objects();
      expect(d.length).toBe(4);
      expect(Object.keys(d[0])).toEqual(['a', 'b', 'c']);
      expect(d[0]).toEqual({ a: 1, b: 'row1', c: 5.2 });
    });
  });
  describe('view(0:2,)', () => {
    let view: ITable;
    beforeEach(() => {
      view = table.view('0:2,');
    });
    it('base', () => {
      expect(view.ncol).toBe(3);
      expect(view.nrow).toBe(2);
      expect(view.dim).toEqual([2, 3]);
    });
    it('at', async () => {
      expect(await view.at(0, 0)).toBe(1);
      expect(await view.at(1, 0)).toBe(2);
      expect(await view.at(1, 1)).toBe('row2');
      expect(await view.at(4, 0)).toBeUndefined();
    });
    it('cols', () => {
      expect(view.cols().length).toBe(3);
      expect(view.cols([0, 1]).length).toBe(2);
      expect(view.cols([0, 2]).length).toBe(2);
    });
    it('col', async () => {
      expect(view.col(0).valuetype.type).toBe('real');
      expect(view.col(0).length).toBe(2);
      expect(await view.col(0).data()).toEqual([1, 2]);
      expect(view.col(1).valuetype.type).toBe('categorical');
      expect(await view.col(1).data()).toEqual(['row1', 'row2']);
      expect(view.col(2).valuetype.type).toBe('real');
      expect(await view.col(2).data()).toEqual([5.2, 10.2]);
    });
    it('data', async () => {
      const d = await view.data();
      expect(d.length).toBe(2);
      expect(d[0]).toEqual([1, 'row1', 5.2]);
    });
    it('objects', async () => {
      const d = await view.objects();
      expect(d.length).toBe(2);
      expect(Object.keys(d[0])).toEqual(['a', 'b', 'c']);
      expect(d[0]).toEqual({ a: 1, b: 'row1', c: 5.2 });
    });
  });
  describe('view(0:2,0:2)', () => {
    let view: ITable;
    beforeEach(() => {
      view = table.view('0:2,0:2');
    });
    it('base', () => {
      expect(view.ncol).toBe(2);
      expect(view.nrow).toBe(2);
      expect(view.dim).toEqual([2, 2]);
    });
    it('at', async () => {
      expect(await view.at(0, 0)).toBe(1);
      expect(await view.at(1, 0)).toBe(2);
      expect(await view.at(1, 1)).toBe('row2');
      expect(await view.at(4, 0)).toBeUndefined();
    });
    it('cols', () => {
      expect(view.cols().length).toBe(2);
      expect(view.cols([0, 1]).length).toBe(2);
      expect(view.cols([0, 2]).length).toBe(2);
    });
    it('col', async () => {
      expect(view.col(0).valuetype.type).toBe('real');
      expect(view.col(0).length).toBe(2);
      expect(await view.col(0).data()).toEqual([1, 2]);
      expect(view.col(1).valuetype.type).toBe('categorical');
      expect(await view.col(1).data()).toEqual(['row1', 'row2']);
      expect(view.col(2)).toBeUndefined();
    });
    it('data', async () => {
      const d = await view.data();
      expect(d.length).toBe(2);
      expect(d[0]).toEqual([1, 'row1']);
    });
    it('objects', async () => {
      const d = await view.objects();
      expect(d.length).toBe(2);
      expect(Object.keys(d[0])).toEqual(['a', 'b']);
      expect(d[0]).toEqual({ a: 1, b: 'row1' });
    });
  });
});
