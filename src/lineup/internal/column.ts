import { Column, IColumnDesc, IDataProvider, ValueColumn } from 'lineupjs';

import { ErrorAlertHandler } from '../../base/ErrorAlertHandler';
import { IScoreRow } from '../../base/interfaces';
import { LineupUtils } from '../utils';

export interface ILazyLoadedColumn {
  col: Column;
  loaded: Promise<Column>;
  reload: (data: Promise<IScoreRow<any>[]>) => Promise<Column>;
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
    // mark as lazy loaded
    colDesc.lazyLoaded = !loaded;
  }
}
