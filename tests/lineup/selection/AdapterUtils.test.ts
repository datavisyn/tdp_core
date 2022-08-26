/// <reference types="jest" />
import { buildCategoricalColumn, CategoricalColumn, Column } from 'lineupjs';
import { difference } from 'lodash';
import { IAdditionalColumnDesc } from '../../../src/base';
import { IDTypeManager } from '../../../src/idtype';
import { AdapterUtils, IContext, ISelectionColumn } from '../../../src/lineup';

describe('SingleSelectionAdapter', () => {
  const singleSelectionAdapter = AdapterUtils.single({
    createDesc: (id: string) => {
      return Promise.resolve({
        selectedId: id,
        label: `Dynamic column for ${id}`,
        type: 'number',
        initialRanking: false,
      });
    },
    loadData: () => {
      return Promise.resolve([]);
    },
  });

  const selection = {
    idtype: IDTypeManager.getInstance().resolveIdType('foo'),
    ids: ['id1', 'id2'],
  };
  const freeColor = jest.fn(); // unused in this test

  describe('With empty ranking', () => {
    const emptyRanking = []; // simulate empty ranking

    it('Trigger parameterChanged() with two selected ids', async () => {
      const add = jest.fn((columns: ISelectionColumn[]) => {
        expect(columns.length).toBe(2); // two columns for two ids

        // notice reverse order! -> [0] = id2
        expect(columns[0].desc.selectedId).toBe('id2');
        expect(columns[1].desc.selectedId).toBe('id1');

        expect(columns[0].desc.label).toBe('Dynamic column for id2');
        expect(columns[1].desc.label).toBe('Dynamic column for id1');

        return Promise.resolve();
      });

      const remove = jest.fn();

      const context: IContext = {
        columns: emptyRanking,
        selection,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await singleSelectionAdapter.parameterChanged(context);

      // remove() should not be called, because the ranking is empty
      expect(remove).toHaveBeenCalledTimes(0);
    });

    // Note: selectionChanged() has the same results as parameterChanged(), because of the empty ranking
    it('Trigger selectionChanged() with two selected ids', async () => {
      const add = jest.fn((columns: ISelectionColumn[]) => {
        expect(columns.length).toBe(2); // two columns for two ids

        // notice reverse order! -> [0] = id2
        expect(columns[0].desc.selectedId).toBe('id2');
        expect(columns[1].desc.selectedId).toBe('id1');

        expect(columns[0].desc.label).toBe('Dynamic column for id2');
        expect(columns[1].desc.label).toBe('Dynamic column for id1');

        return Promise.resolve();
      });

      const remove = jest.fn();

      const context: IContext = {
        columns: emptyRanking,
        selection,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await singleSelectionAdapter.parameterChanged(context);

      // remove() should not be called, because the ranking is empty
      expect(remove).toHaveBeenCalledTimes(0);
    });
  });

  describe('With initial columns in ranking, but without dynamic columns', () => {
    const columnsInRanking = [
      new CategoricalColumn('cat1', buildCategoricalColumn('Cat 1', []).build([])),
      new CategoricalColumn('cat2', buildCategoricalColumn('Cat 2', []).build([])),
    ];

    it('Trigger parameterChanged() with two selected ids', async () => {
      const add = jest.fn((columns: ISelectionColumn[]) => {
        expect(columns.length).toBe(2); // two columns for two ids

        // notice reverse order! -> [0] = id2
        expect(columns[0].desc.selectedId).toBe('id2');
        expect(columns[1].desc.selectedId).toBe('id1');

        expect(columns[0].desc.label).toBe('Dynamic column for id2');
        expect(columns[1].desc.label).toBe('Dynamic column for id1');

        return Promise.resolve();
      });

      const remove = jest.fn();

      const context: IContext = {
        columns: columnsInRanking,
        selection,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await singleSelectionAdapter.parameterChanged(context);

      // remove() should not be called, because the ranking does not contain dynamic columns that can be removed
      expect(remove).toHaveBeenCalledTimes(0);
    });

    // selectionChanged() has the same results as parameterChanged(), because of the empty ranking
    it('Trigger selectionChanged() with two selected ids', async () => {
      const add = jest.fn((columns: ISelectionColumn[]) => {
        expect(columns.length).toBe(2); // two columns for two ids

        // notice reverse order! -> [0] = id2
        expect(columns[0].desc.selectedId).toBe('id2');
        expect(columns[1].desc.selectedId).toBe('id1');

        expect(columns[0].desc.label).toBe('Dynamic column for id2');
        expect(columns[1].desc.label).toBe('Dynamic column for id1');

        return Promise.resolve();
      });

      const remove = jest.fn();

      const context: IContext = {
        columns: columnsInRanking,
        selection,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await singleSelectionAdapter.parameterChanged(context);

      // remove() should not be called, because the ranking does not contain dynamic columns that can be removed
      expect(remove).toHaveBeenCalledTimes(0);
    });
  });

  describe('With existing dynamic columns in ranking', () => {
    // Note the property `selectedId` additionally to the original categorical column desc
    const columnDesc1: IAdditionalColumnDesc = { ...buildCategoricalColumn('Cat 1', []).build([]), selectedId: 'id1', initialRanking: true };
    const columnDesc2: IAdditionalColumnDesc = { ...buildCategoricalColumn('Cat 2', []).build([]), selectedId: 'id2', initialRanking: true };

    it('Trigger parameterChanged() with the same selected ids as existing dynamic columns', async () => {
      const columnsInRanking = [new CategoricalColumn('cat1', columnDesc1), new CategoricalColumn('cat2', columnDesc2)];

      const add = jest.fn((columns: ISelectionColumn[]) => {
        expect(columns.length).toBe(2); // two columns for two ids

        // notice reverse order! -> [0] = id2
        expect(columns[0].desc.selectedId).toBe('id2');
        expect(columns[1].desc.selectedId).toBe('id1');

        expect(columns[0].desc.label).toBe('Dynamic column for id2');
        expect(columns[1].desc.label).toBe('Dynamic column for id1');

        return Promise.resolve();
      });

      const remove = jest.fn((columns: Column[]) => {
        expect(columns.length).toBe(2); // two columns for two ids

        // notice correct order! -> [0] = id1
        expect((<IAdditionalColumnDesc>columns[0].desc).selectedId).toBe('id1');
        expect((<IAdditionalColumnDesc>columns[1].desc).selectedId).toBe('id2');

        expect(columns[0].desc.label).toBe('Cat 1');
        expect(columns[1].desc.label).toBe('Cat 2');

        return Promise.resolve();
      });

      const context: IContext = {
        columns: columnsInRanking,
        selection,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await singleSelectionAdapter.parameterChanged(context);

      // add() will be called once because it will add two dynamic columns for the ids in `selection`
      expect(add).toHaveBeenCalledTimes(1);

      // remove() will be called once because the `SingleSelectionAdapter` removes **all** columns first and then adds them again
      expect(remove).toHaveBeenCalledTimes(1);
    });

    it('Trigger parameterChanged() with a new selected id -> adds a dynamic column', async () => {
      const columnsInRanking = [new CategoricalColumn('cat1', columnDesc1)]; // only cat1

      const add = jest.fn((columns: ISelectionColumn[]) => {
        expect(columns.length).toBe(2); // two columns for two ids

        // notice reverse order! -> [0] = id2
        expect(columns[0].desc.selectedId).toBe('id2');
        expect(columns[1].desc.selectedId).toBe('id1');

        expect(columns[0].desc.label).toBe('Dynamic column for id2');
        expect(columns[1].desc.label).toBe('Dynamic column for id1');

        return Promise.resolve();
      });

      const remove = jest.fn((columns: Column[]) => {
        expect(columns.length).toBe(1); // two columns for two ids

        // notice correct order! -> [0] = id1
        expect((<IAdditionalColumnDesc>columns[0].desc).selectedId).toBe('id1');

        expect(columns[0].desc.label).toBe('Cat 1');

        return Promise.resolve();
      });

      const context: IContext = {
        columns: columnsInRanking,
        selection,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await singleSelectionAdapter.parameterChanged(context);

      // add() will be called once because it will add two dynamic columns for the ids in `selection`
      expect(add).toHaveBeenCalledTimes(1);

      // remove() will be called once because the `SingleSelectionAdapter` removes **all** columns first and then adds them again
      expect(remove).toHaveBeenCalledTimes(1);
    });

    it('Trigger selectionChanged() with the same selected ids as existing dynamic columns', async () => {
      const columnsInRanking = [new CategoricalColumn('cat1', columnDesc1), new CategoricalColumn('cat2', columnDesc2)];

      const add = jest.fn();
      const remove = jest.fn();

      const context: IContext = {
        columns: columnsInRanking,
        selection,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await singleSelectionAdapter.selectionChanged(context);

      // add() will not be called because the two dynamic columns are matching the ids in `selection`
      expect(add).toHaveBeenCalledTimes(0);

      // remove() will not be called because the two dynamic columns are matching the ids in `selection`
      expect(remove).toHaveBeenCalledTimes(0);
    });

    it('Trigger selectionChanged() with a new selected id -> adds a dynamic column', async () => {
      const columnsInRanking = [new CategoricalColumn('cat1', columnDesc1)]; // only cat1

      const add = jest.fn((columns: ISelectionColumn[]) => {
        expect(columns.length).toBe(1); // one column for the additional id
        expect(columns[0].desc.selectedId).toBe('id2');
        expect(columns[0].desc.label).toBe('Dynamic column for id2');

        return Promise.resolve();
      });

      const remove = jest.fn();

      const context: IContext = {
        columns: columnsInRanking,
        selection,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await singleSelectionAdapter.selectionChanged(context);

      // add() will be called once because it will add two dynamic columns for the ids in `selection`
      expect(add).toHaveBeenCalledTimes(1);

      // remove() will not be called because the two dynamic columns are matching the ids in `selection`
      expect(remove).toHaveBeenCalledTimes(0);
    });

    it('Trigger selectionChanged() with a missing selected id -> remove dynamic column', async () => {
      const selectionWithSingleId = {
        idtype: IDTypeManager.getInstance().resolveIdType('foo'),
        ids: ['id2'],
      };

      const columnsInRanking = [new CategoricalColumn('cat1', columnDesc1), new CategoricalColumn('cat2', columnDesc2)]; // only cat1

      const add = jest.fn();

      const remove = jest.fn((columns: Column[]) => {
        expect(columns.length).toBe(1); // two columns for two ids

        // notice correct order! -> [0] = id1
        expect((<IAdditionalColumnDesc>columns[0].desc).selectedId).toBe('id1');

        expect(columns[0].desc.label).toBe('Cat 1');

        return Promise.resolve();
      });

      const context: IContext = {
        columns: columnsInRanking,
        selection: selectionWithSingleId,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await singleSelectionAdapter.selectionChanged(context);

      // add() will not be called because the two dynamic columns are matching the ids in `selection`
      expect(add).toHaveBeenCalledTimes(0);

      // remove() will not be called because the two dynamic columns are matching the ids in `selection`
      expect(remove).toHaveBeenCalledTimes(1);
    });
  });
});

describe('MultiSelectionAdapter with subtypes of type string (default)', () => {
  const multiSelectionAdapter = AdapterUtils.multi({
    getSelectedSubTypes: () => {
      return ['subtype1', 'subtype2'];
    },
    createDescs: (id: string, subtypes: string[]) => {
      const descs = subtypes.map((subtype) => {
        return {
          selectedId: id,
          label: `Dynamic column for ${id} and ${subtype}`,
          type: 'number',
          initialRanking: false,
        };
      });
      return Promise.resolve(descs);
    },
    loadData: (_id: string, descs: IAdditionalColumnDesc[]) => {
      return descs.map(() => Promise.resolve([]));
    },
  });

  const selection = {
    idtype: IDTypeManager.getInstance().resolveIdType('foo'),
    ids: ['id1', 'id2'],
  };
  const freeColor = jest.fn(); // unused in this test

  describe('With empty ranking', () => {
    const emptyRanking = []; // simulate empty ranking

    it('Trigger parameterChanged() with two selected ids', async () => {
      const add = jest.fn((columns: ISelectionColumn[]) => {
        expect(columns.length).toBe(4); // two columns for two ids

        // notice reverse order! -> [0] = id2
        expect(columns[0].desc.selectedId).toBe('id2');
        expect(columns[1].desc.selectedId).toBe('id2');
        expect(columns[2].desc.selectedId).toBe('id1');
        expect(columns[3].desc.selectedId).toBe('id1');

        expect(columns[0].desc.label).toBe('Dynamic column for id2 and subtype2');
        expect(columns[1].desc.label).toBe('Dynamic column for id2 and subtype1');
        expect(columns[2].desc.label).toBe('Dynamic column for id1 and subtype2');
        expect(columns[3].desc.label).toBe('Dynamic column for id1 and subtype1');

        return Promise.resolve();
      });

      const remove = jest.fn((columns: Column[]) => {
        expect(columns.length).toBe(0); // no columns to remove
        return Promise.resolve();
      });

      const context: IContext = {
        columns: emptyRanking,
        selection,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await multiSelectionAdapter.parameterChanged(context);

      // add() will be called once because it will add four dynamic columns for the ids in `selection`
      expect(add).toHaveBeenCalledTimes(1);

      // remove() will be called but with zero columns to remove
      expect(remove).toHaveBeenCalledTimes(1);
    });

    // Note: selectionChanged() has the same results as parameterChanged(), because of the empty ranking
    it('Trigger selectionChanged() with two selected ids', async () => {
      const add = jest.fn((columns: ISelectionColumn[]) => {
        expect(columns.length).toBe(4); // two columns for two ids

        // notice reverse order! -> [0] = id2
        expect(columns[0].desc.selectedId).toBe('id2');
        expect(columns[1].desc.selectedId).toBe('id2');
        expect(columns[2].desc.selectedId).toBe('id1');
        expect(columns[3].desc.selectedId).toBe('id1');

        expect(columns[0].desc.label).toBe('Dynamic column for id2 and subtype2');
        expect(columns[1].desc.label).toBe('Dynamic column for id2 and subtype1');
        expect(columns[2].desc.label).toBe('Dynamic column for id1 and subtype2');
        expect(columns[3].desc.label).toBe('Dynamic column for id1 and subtype1');

        return Promise.resolve();
      });

      const remove = jest.fn((columns: Column[]) => {
        expect(columns.length).toBe(0); // no columns to remove
        return Promise.resolve();
      });

      const context: IContext = {
        columns: emptyRanking,
        selection,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await multiSelectionAdapter.parameterChanged(context);

      // add() will be called once because it will add four dynamic columns for the ids in `selection`
      expect(add).toHaveBeenCalledTimes(1);

      // remove() will be called but with zero columns to remove
      expect(remove).toHaveBeenCalledTimes(1);
    });
  });

  describe('With initial columns in ranking, but without dynamic columns', () => {
    const columnsInRanking = [
      new CategoricalColumn('cat1', buildCategoricalColumn('Cat 1', []).build([])),
      new CategoricalColumn('cat2', buildCategoricalColumn('Cat 2', []).build([])),
    ];

    it('Trigger parameterChanged() with two selected ids', async () => {
      const add = jest.fn((columns: ISelectionColumn[]) => {
        expect(columns.length).toBe(4); // two columns for two ids

        // notice reverse order! -> [0] = id2
        expect(columns[0].desc.selectedId).toBe('id2');
        expect(columns[1].desc.selectedId).toBe('id2');
        expect(columns[2].desc.selectedId).toBe('id1');
        expect(columns[3].desc.selectedId).toBe('id1');

        expect(columns[0].desc.label).toBe('Dynamic column for id2 and subtype2');
        expect(columns[1].desc.label).toBe('Dynamic column for id2 and subtype1');
        expect(columns[2].desc.label).toBe('Dynamic column for id1 and subtype2');
        expect(columns[3].desc.label).toBe('Dynamic column for id1 and subtype1');

        return Promise.resolve();
      });

      const remove = jest.fn((columns: Column[]) => {
        expect(columns.length).toBe(0); // no columns to remove
        return Promise.resolve();
      });

      const context: IContext = {
        columns: columnsInRanking,
        selection,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await multiSelectionAdapter.parameterChanged(context);

      // add() will be called once because it will add four dynamic columns for the ids in `selection`
      expect(add).toHaveBeenCalledTimes(1);

      // remove() will be called but with zero columns to remove
      expect(remove).toHaveBeenCalledTimes(1);
    });

    // selectionChanged() has the same results as parameterChanged(), because of the empty ranking
    it('Trigger selectionChanged() with two selected ids', async () => {
      const add = jest.fn((columns: ISelectionColumn[]) => {
        expect(columns.length).toBe(4); // two columns for two ids

        // notice reverse order! -> [0] = id2
        expect(columns[0].desc.selectedId).toBe('id2');
        expect(columns[1].desc.selectedId).toBe('id2');
        expect(columns[2].desc.selectedId).toBe('id1');
        expect(columns[3].desc.selectedId).toBe('id1');

        expect(columns[0].desc.label).toBe('Dynamic column for id2 and subtype2');
        expect(columns[1].desc.label).toBe('Dynamic column for id2 and subtype1');
        expect(columns[2].desc.label).toBe('Dynamic column for id1 and subtype2');
        expect(columns[3].desc.label).toBe('Dynamic column for id1 and subtype1');

        return Promise.resolve();
      });

      const remove = jest.fn((columns: Column[]) => {
        expect(columns.length).toBe(0); // no columns to remove
        return Promise.resolve();
      });

      const context: IContext = {
        columns: columnsInRanking,
        selection,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await multiSelectionAdapter.parameterChanged(context);

      // add() will be called once because it will add four dynamic columns for the ids in `selection`
      expect(add).toHaveBeenCalledTimes(1);

      // remove() will be called but with zero columns to remove
      expect(remove).toHaveBeenCalledTimes(1);
    });
  });

  describe('With existing dynamic columns in ranking', () => {
    // Note the property `selectedId` additionally to the original categorical column desc
    const columnDesc1: IAdditionalColumnDesc = { ...buildCategoricalColumn('Cat 1', []).build([]), selectedId: 'id1', initialRanking: true };
    const columnDesc2: IAdditionalColumnDesc = { ...buildCategoricalColumn('Cat 2', []).build([]), selectedId: 'id2', initialRanking: true };

    it('Trigger parameterChanged() with the same selected ids as existing dynamic columns', async () => {
      const columnsInRanking = [new CategoricalColumn('cat1', columnDesc1), new CategoricalColumn('cat2', columnDesc2)];

      const add = jest.fn((columns: ISelectionColumn[]) => {
        expect(columns.length).toBe(4); // four columns for two ids

        // notice reverse order! -> [0] = id2
        expect(columns[0].desc.selectedId).toBe('id2');
        expect(columns[1].desc.selectedId).toBe('id2');
        expect(columns[2].desc.selectedId).toBe('id1');
        expect(columns[3].desc.selectedId).toBe('id1');

        expect(columns[0].desc.label).toBe('Dynamic column for id2 and subtype2');
        expect(columns[1].desc.label).toBe('Dynamic column for id2 and subtype1');
        expect(columns[2].desc.label).toBe('Dynamic column for id1 and subtype2');
        expect(columns[3].desc.label).toBe('Dynamic column for id1 and subtype1');

        return Promise.resolve();
      });

      const remove = jest.fn((columns: Column[]) => {
        expect(columns.length).toBe(0); // no columns to remove
        return Promise.resolve();
      });

      const context: IContext = {
        columns: columnsInRanking,
        selection,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await multiSelectionAdapter.parameterChanged(context);

      // add() will be called once because it will add four dynamic columns for the ids in `selection`
      expect(add).toHaveBeenCalledTimes(1);

      // remove() will be called but with zero columns to remove
      expect(remove).toHaveBeenCalledTimes(1);
    });

    it('Trigger parameterChanged() with a new selected id -> adds four dynamic columns', async () => {
      const columnsInRanking = [new CategoricalColumn('cat1', columnDesc1)]; // only cat1

      const add = jest.fn((columns: ISelectionColumn[]) => {
        expect(columns.length).toBe(4); // four columns for two ids

        // notice reverse order! -> [0] = id2
        expect(columns[0].desc.selectedId).toBe('id2');
        expect(columns[1].desc.selectedId).toBe('id2');
        expect(columns[2].desc.selectedId).toBe('id1');
        expect(columns[3].desc.selectedId).toBe('id1');

        expect(columns[0].desc.label).toBe('Dynamic column for id2 and subtype2');
        expect(columns[1].desc.label).toBe('Dynamic column for id2 and subtype1');
        expect(columns[2].desc.label).toBe('Dynamic column for id1 and subtype2');
        expect(columns[3].desc.label).toBe('Dynamic column for id1 and subtype1');

        return Promise.resolve();
      });

      const remove = jest.fn((columns: Column[]) => {
        expect(columns.length).toBe(0); // no column to remove

        return Promise.resolve();
      });

      const context: IContext = {
        columns: columnsInRanking,
        selection,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await multiSelectionAdapter.parameterChanged(context);

      // add() will be called once because it will add four dynamic columns for the ids in `selection`
      expect(add).toHaveBeenCalledTimes(1);

      // remove() will be called but with zero columns to remove
      expect(remove).toHaveBeenCalledTimes(1);
    });

    it('Trigger selectionChanged() with the same selected ids as existing dynamic columns', async () => {
      const columnsInRanking = [new CategoricalColumn('cat1', columnDesc1), new CategoricalColumn('cat2', columnDesc2)];

      const add = jest.fn();
      const remove = jest.fn();

      const context: IContext = {
        columns: columnsInRanking,
        selection,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await multiSelectionAdapter.selectionChanged(context);

      // add() will not be called because the two dynamic columns are matching the ids in `selection`
      expect(add).toHaveBeenCalledTimes(0);

      // remove() will not be called because the two dynamic columns are matching the ids in `selection`
      expect(remove).toHaveBeenCalledTimes(0);
    });

    it('Trigger selectionChanged() with a new selected id -> adds two dynamic columns', async () => {
      const columnsInRanking = [new CategoricalColumn('cat1', columnDesc1)]; // only cat1

      const add = jest.fn((columns: ISelectionColumn[]) => {
        expect(columns.length).toBe(2); // one column for the additional id

        expect(columns[0].desc.selectedId).toBe('id2');
        expect(columns[0].desc.label).toBe('Dynamic column for id2 and subtype2');

        expect(columns[1].desc.selectedId).toBe('id2');
        expect(columns[1].desc.label).toBe('Dynamic column for id2 and subtype1');

        return Promise.resolve();
      });

      const remove = jest.fn();

      const context: IContext = {
        columns: columnsInRanking,
        selection,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await multiSelectionAdapter.selectionChanged(context);

      // add() will be called once because it will add four dynamic columns for the ids in `selection`
      expect(add).toHaveBeenCalledTimes(1);

      // remove() will not be called because the two dynamic columns are matching the ids in `selection`
      expect(remove).toHaveBeenCalledTimes(0);
    });

    it('Trigger selectionChanged() with a missing selected id -> remove dynamic column', async () => {
      const selectionWithSingleId = {
        idtype: IDTypeManager.getInstance().resolveIdType('foo'),
        ids: ['id2'],
      };

      const columnsInRanking = [new CategoricalColumn('cat1', columnDesc1), new CategoricalColumn('cat2', columnDesc2)]; // only cat1

      const add = jest.fn();

      const remove = jest.fn((columns: Column[]) => {
        expect(columns.length).toBe(1); // two columns for two ids

        // notice correct order! -> [0] = id1
        expect((<IAdditionalColumnDesc>columns[0].desc).selectedId).toBe('id1');

        expect(columns[0].desc.label).toBe('Cat 1');

        return Promise.resolve();
      });

      const context: IContext = {
        columns: columnsInRanking,
        selection: selectionWithSingleId,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await multiSelectionAdapter.selectionChanged(context);

      // add() will not be called because the two dynamic columns are matching the ids in `selection`
      expect(add).toHaveBeenCalledTimes(0);

      // remove() will not be called because the two dynamic columns are matching the ids in `selection`
      expect(remove).toHaveBeenCalledTimes(1);
    });
  });
});

describe('MultiSelectionAdapter with subtypes of custom type', () => {
  // define interface and use it as generic below
  interface ICustomType {
    entityId: string;
    columnSelection: string;
  }

  const multiSelectionAdapter = AdapterUtils.multi<ICustomType>({
    getSelectedSubTypes: () => {
      return [
        { entityId: 'entityId1', columnSelection: 'columnSelection1' },
        { entityId: 'entityId2', columnSelection: 'columnSelection2' },
      ];
    },
    // Note this additional function when using a custom type!
    diffSubtypes: (columnSubtypes: string[], selectedSubtypes: ICustomType[]) => {
      return difference(
        columnSubtypes,
        selectedSubtypes.map((mapping) => mapping.columnSelection),
      );
    },
    createDescs: (id: string, subtypes: ICustomType[]) => {
      const descs = subtypes.map((subtype) => {
        return {
          selectedId: id,
          label: `Dynamic column for ${id} and ${subtype.entityId}`,
          type: 'number',
          initialRanking: false,
        };
      });
      return Promise.resolve(descs);
    },
    loadData: (_id: string, descs: IAdditionalColumnDesc[]) => {
      return descs.map(() => Promise.resolve([]));
    },
  });

  const selection = {
    idtype: IDTypeManager.getInstance().resolveIdType('foo'),
    ids: ['id1', 'id2'],
  };
  const freeColor = jest.fn(); // unused in this test
  describe('With existing dynamic columns in ranking', () => {
    // Note the property `selectedId` additionally to the original categorical column desc
    const columnDesc1: IAdditionalColumnDesc = { ...buildCategoricalColumn('Cat 1', []).build([]), selectedId: 'id1', initialRanking: true };
    const columnDesc2: IAdditionalColumnDesc = { ...buildCategoricalColumn('Cat 2', []).build([]), selectedId: 'id2', initialRanking: true };

    it('Trigger parameterChanged() with the same selected ids as existing dynamic columns', async () => {
      const columnsInRanking = [new CategoricalColumn('cat1', columnDesc1), new CategoricalColumn('cat2', columnDesc2)];

      const add = jest.fn((columns: ISelectionColumn[]) => {
        expect(columns.length).toBe(4); // four columns for two ids

        // notice reverse order! -> [0] = id2
        expect(columns[0].desc.selectedId).toBe('id2');
        expect(columns[1].desc.selectedId).toBe('id2');
        expect(columns[2].desc.selectedId).toBe('id1');
        expect(columns[3].desc.selectedId).toBe('id1');

        expect(columns[0].desc.label).toBe('Dynamic column for id2 and entityId2');
        expect(columns[1].desc.label).toBe('Dynamic column for id2 and entityId1');
        expect(columns[2].desc.label).toBe('Dynamic column for id1 and entityId2');
        expect(columns[3].desc.label).toBe('Dynamic column for id1 and entityId1');

        return Promise.resolve();
      });

      const remove = jest.fn((columns: Column[]) => {
        expect(columns.length).toBe(0); // no columns to remove
        return Promise.resolve();
      });

      const context: IContext = {
        columns: columnsInRanking,
        selection,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await multiSelectionAdapter.parameterChanged(context);

      // add() will be called once because it will add four dynamic columns for the ids in `selection`
      expect(add).toHaveBeenCalledTimes(1);

      // remove() will be called but with zero columns to remove
      expect(remove).toHaveBeenCalledTimes(1);
    });

    it('Trigger parameterChanged() with a new selected id -> adds four dynamic columns', async () => {
      const columnsInRanking = [new CategoricalColumn('cat1', columnDesc1)]; // only cat1

      const add = jest.fn((columns: ISelectionColumn[]) => {
        expect(columns.length).toBe(4); // four columns for two ids

        // notice reverse order! -> [0] = id2
        expect(columns[0].desc.selectedId).toBe('id2');
        expect(columns[1].desc.selectedId).toBe('id2');
        expect(columns[2].desc.selectedId).toBe('id1');
        expect(columns[3].desc.selectedId).toBe('id1');

        expect(columns[0].desc.label).toBe('Dynamic column for id2 and entityId2');
        expect(columns[1].desc.label).toBe('Dynamic column for id2 and entityId1');
        expect(columns[2].desc.label).toBe('Dynamic column for id1 and entityId2');
        expect(columns[3].desc.label).toBe('Dynamic column for id1 and entityId1');

        return Promise.resolve();
      });

      const remove = jest.fn((columns: Column[]) => {
        expect(columns.length).toBe(0); // no column to remove

        return Promise.resolve();
      });

      const context: IContext = {
        columns: columnsInRanking,
        selection,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await multiSelectionAdapter.parameterChanged(context);

      // add() will be called once because it will add four dynamic columns for the ids in `selection`
      expect(add).toHaveBeenCalledTimes(1);

      // remove() will be called but with zero columns to remove
      expect(remove).toHaveBeenCalledTimes(1);
    });

    it('Trigger selectionChanged() with the same selected ids as existing dynamic columns', async () => {
      const columnsInRanking = [new CategoricalColumn('cat1', columnDesc1), new CategoricalColumn('cat2', columnDesc2)];

      const add = jest.fn();
      const remove = jest.fn();

      const context: IContext = {
        columns: columnsInRanking,
        selection,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await multiSelectionAdapter.selectionChanged(context);

      // add() will not be called because the two dynamic columns are matching the ids in `selection`
      expect(add).toHaveBeenCalledTimes(0);

      // remove() will not be called because the two dynamic columns are matching the ids in `selection`
      expect(remove).toHaveBeenCalledTimes(0);
    });

    it('Trigger selectionChanged() with a new selected id -> adds two dynamic columns', async () => {
      const columnsInRanking = [new CategoricalColumn('cat1', columnDesc1)]; // only cat1

      const add = jest.fn((columns: ISelectionColumn[]) => {
        expect(columns.length).toBe(2); // one column for the additional id

        expect(columns[0].desc.selectedId).toBe('id2');
        expect(columns[0].desc.label).toBe('Dynamic column for id2 and entityId2');

        expect(columns[1].desc.selectedId).toBe('id2');
        expect(columns[1].desc.label).toBe('Dynamic column for id2 and entityId1');

        return Promise.resolve();
      });

      const remove = jest.fn();

      const context: IContext = {
        columns: columnsInRanking,
        selection,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await multiSelectionAdapter.selectionChanged(context);

      // add() will be called once because it will add four dynamic columns for the ids in `selection`
      expect(add).toHaveBeenCalledTimes(1);

      // remove() will not be called because the two dynamic columns are matching the ids in `selection`
      expect(remove).toHaveBeenCalledTimes(0);
    });

    it('Trigger selectionChanged() with a missing selected id -> remove dynamic column', async () => {
      const selectionWithSingleId = {
        idtype: IDTypeManager.getInstance().resolveIdType('foo'),
        ids: ['id2'],
      };

      const columnsInRanking = [new CategoricalColumn('cat1', columnDesc1), new CategoricalColumn('cat2', columnDesc2)]; // only cat1

      const add = jest.fn();

      const remove = jest.fn((columns: Column[]) => {
        expect(columns.length).toBe(1); // two columns for two ids

        // notice correct order! -> [0] = id1
        expect((<IAdditionalColumnDesc>columns[0].desc).selectedId).toBe('id1');

        expect(columns[0].desc.label).toBe('Cat 1');

        return Promise.resolve();
      });

      const context: IContext = {
        columns: columnsInRanking,
        selection: selectionWithSingleId,
        freeColor,
        add,
        remove,
      };

      // wait for the promise to resolve before checking for number of function calls
      await multiSelectionAdapter.selectionChanged(context);

      // add() will not be called because the two dynamic columns are matching the ids in `selection`
      expect(add).toHaveBeenCalledTimes(0);

      // remove() will not be called because the two dynamic columns are matching the ids in `selection`
      expect(remove).toHaveBeenCalledTimes(1);
    });
  });
});
