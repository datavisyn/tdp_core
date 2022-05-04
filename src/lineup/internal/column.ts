import { IDataProvider, IColumnDesc, ScaleMappingFunction, ValueColumn, NumberColumn, BoxPlotColumn, NumbersColumn, Column, toCategories } from 'lineupjs';
import { extent, min, max } from 'd3v3';
import { LineupUtils } from '../utils';
import { IScoreRow, IScoreColumnPatcherExtensionDesc } from '../../base/interfaces';
import { EP_TDP_CORE_SCORE_COLUMN_PATCHER } from '../../base/extensions';
import { ErrorAlertHandler } from '../../base/ErrorAlertHandler';
import { PluginRegistry } from '../../app';

export interface ILazyLoadedColumn {
  col: Column;
  loaded: Promise<Column>;
  reload: (data: Promise<IScoreRow<any>[]>) => Promise<Column>;
}

function extentByType(type: string, rows: any, acc: (d: any) => any): [number, number] {
  switch (type) {
    case 'numbers':
      return [min(rows, (d) => min(acc(d))), max(rows, (d) => max(acc(d)))];
    case 'boxplot':
      return [min(rows, (d) => acc(d).min), max(rows, (d) => acc(d).max)];
    default:
      return extent(rows, acc);
  }
}
export class LazyColumn {
  static addLazyColumn(
    colDesc: any,
    data: Promise<IScoreRow<any>[]>,
    provider: IDataProvider & { pushDesc(col: IColumnDesc): void },
    position: number,
    done?: () => void,
  ): ILazyLoadedColumn {
    const ranking = provider.getLastRanking();
    const accessor = LineupUtils.createAccessor(colDesc);

    // generate a unique column
    (<any>colDesc).column = colDesc.scoreID || `dC${colDesc.label.replace(/\s+/, '')}`;

    provider.pushDesc(colDesc);
    // mark as lazy loaded
    (<any>colDesc).lazyLoaded = true;
    const col = provider.create(colDesc);
    if (position == null) {
      ranking.push(col);
    } else {
      if (position < 0) {
        position = ranking.children.length - -position + 1; // -- since negative
      }
      ranking.insert(col, position);
    }

    if (colDesc.sortedByMe) {
      col.sortByMe(colDesc.sortedByMe === true || colDesc.sortedByMe === 'asc');
    }
    if (colDesc.groupByMe) {
      col.groupByMe();
    }

    // error handling
    data.catch(ErrorAlertHandler.getInstance().errorAlert).catch(() => {
      ranking.remove(col);
    });

    // success
    const loaded = data.then(async (rows: IScoreRow<any>[]) => {
      accessor.setRows(rows);
      await LazyColumn.patchColumn(colDesc, rows, col);
      LazyColumn.markLoaded(provider, colDesc, true);

      if (done) {
        done();
      }
      return col;
    });

    const reload = (newData: Promise<IScoreRow<any>[]>) => {
      accessor.clear();
      LazyColumn.markLoaded(provider, colDesc, false);

      newData.catch(ErrorAlertHandler.getInstance().errorAlert);
      // success
      return newData.then(async (rows: IScoreRow<any>[]) => {
        accessor.setRows(rows);
        await LazyColumn.patchColumn(colDesc, rows, col);
        LazyColumn.markLoaded(provider, colDesc, true);
        return col;
      });
    };

    return { col, loaded, reload };
  }

  private static markLoaded(provider: IDataProvider, colDesc: any, loaded: boolean): void {
    // find all columns with the same descriptions (generated snapshots) to set their `setLoaded` value
    provider.getRankings().forEach((ranking) => {
      const columns = ranking.flatColumns.filter((rankCol) => rankCol.desc === colDesc);
      columns.forEach((column) => (<ValueColumn<any>>column).setLoaded(loaded));
    });

    // mark the description as loaded true
    // mark as lazy loaded
    (<any>colDesc).lazyLoaded = !loaded;
  }

  private static async patchColumn(colDesc: any, rows: IScoreRow<any>[], col: Column): Promise<void> {
    if (colDesc.type === 'number' || colDesc.type === 'boxplot' || colDesc.type === 'numbers') {
      const ncol = <NumberColumn | BoxPlotColumn | NumbersColumn>col;
      if (!colDesc.constantDomain || colDesc.constantDomain === 'max' || colDesc.constantDomain === 'min') {
        // create a dynamic range if not fixed
        const domain = extentByType(colDesc.type, rows, (d) => d.score);
        if (colDesc.constantDomain === 'min') {
          domain[0] = colDesc.domain[0];
        } else if (colDesc.constantDomain === 'max') {
          domain[1] = colDesc.domain[1];
        }
        // HACK by pass the setMapping function and set it inplace
        const ori = <ScaleMappingFunction>(<any>ncol).original;
        const current = <ScaleMappingFunction>(<any>ncol).mapping;
        colDesc.domain = domain;
        ori.domain = domain;
        current.domain = domain;
      }
    }

    if (colDesc.type === 'numbers' && rows.length > 0) {
      // hack in the data length
      const ncol = <NumbersColumn>col;
      const columns = (<any>rows)._columns;
      // inject labels
      if (columns) {
        (<any>ncol).originalLabels = (<any>colDesc).labels = columns;
      }
      (<any>ncol)._dataLength = (<any>colDesc).dataLength = rows[0].score.length;
    }

    if (colDesc.type === 'categorical' && (<any>rows)._categories) {
      const ccol = <any>col;
      colDesc.categories = (<any>rows)._categories;
      const categories = toCategories(colDesc);
      ccol.categories = categories;
      ccol.lookup.clear();
      categories.forEach((c) => ccol.lookup.set(c.name, c));
    }

    // Await all patchers to complete before returning
    await Promise.all(
      PluginRegistry.getInstance()
        .listPlugins(EP_TDP_CORE_SCORE_COLUMN_PATCHER)
        .map(async (pluginDesc: IScoreColumnPatcherExtensionDesc) => {
          const plugin = await pluginDesc.load();
          plugin.factory(pluginDesc, colDesc, rows, col);
        }),
    );
  }
}
