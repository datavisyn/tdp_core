/**
 * Created by Samuel Gratzl on 12.09.2017.
 */
import {IDataProvider} from 'lineupjs/src/provider/ADataProvider';
import {IColumnDesc, ScaleMappingFunction} from 'lineupjs/src/model';
import {createAccessor} from './utils';
import {IScoreRow} from '../../extensions';
import {showErrorModalDialog} from '../../dialogs';
import ValueColumn from 'lineupjs/src/model/ValueColumn';
import NumberColumn from 'lineupjs/src/model/NumberColumn';
import {default as BoxPlotColumn} from 'lineupjs/src/model/BoxPlotColumn';
import NumbersColumn from 'lineupjs/src/model/NumbersColumn';
import Column from 'lineupjs/src/model/Column';
import {extent, min, max} from 'd3';


function extentByType(type: string, rows: any, acc: (d: any) => any): [number, number] {
  switch(type) {
    case 'numbers':
      return [min(rows, (d) => min(acc(d))), max(rows, (d) => max(acc(d)))];
    case 'boxplot':
      return [min(rows, (d) => acc(d).min), max(rows, (d) => acc(d).max)];
    default:
      return extent(rows, acc);
  }
}

export function addLazyColumn(colDesc: any, data: Promise<IScoreRow<any>[]>, provider: IDataProvider & { pushDesc(col: IColumnDesc): void }, position: number, done?: () => void): { col: Column, loaded: Promise<Column> } {
  const ranking = provider.getLastRanking();
  const accessor = createAccessor(colDesc);

  // generate a unique column
  (<any>colDesc).column = `dC${colDesc.label.replace(/\s+/,'')}`;

  provider.pushDesc(colDesc);
  //mark as lazy loaded
  (<any>colDesc).lazyLoaded = true;
  const col = provider.create(colDesc);
  if(position === undefined || position === null) {
    ranking.push(col);
  } else {
    ranking.insert(col, position);
  }

  if (colDesc.sortedByMe) {
    col.sortByMe(colDesc.sortedByMe === true || colDesc.sortedByMe === 'asc');
  }

  // error handling
  data
    .catch(showErrorModalDialog)
    .catch(() => {
      ranking.remove(col);
    });

  // success
  const loaded = data.then((rows: IScoreRow<any>[]) => {
    accessor.rows = rows;

    if (colDesc.type === 'number' || colDesc.type === 'boxplot' || colDesc.type === 'numbers') {
      const ncol = <NumberColumn | BoxPlotColumn | NumbersColumn>col;
      if (!(colDesc.constantDomain) || (colDesc.constantDomain === 'max' || colDesc.constantDomain === 'min')) { //create a dynamic range if not fixed
        const domain = extentByType(colDesc.type, rows, (d) => d.score);
        if (colDesc.constantDomain === 'min') {
          domain[0] = colDesc.domain[0];
        } else if (colDesc.constantDomain === 'max') {
          domain[1] = colDesc.domain[1];
        }
        //HACK by pass the setMapping function and set it inplace
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
      (<any>colDesc).dataLength = rows[0].score.length;
      ncol.setSplicer({length: rows[0].score.length, splice: (d) => d});
    }

    // find all columns with the same descriptions (generated snapshots) to set their `setLoaded` value
    provider.getRankings().forEach((ranking) => {
      const columns = ranking.flatColumns.filter((rankCol) => rankCol.desc === col.desc);
      columns.forEach((column) => (<ValueColumn<any>>column).setLoaded(true));
    });

    // mark the description as loaded true

    //mark as lazy loaded
    (<any>colDesc).lazyLoaded = false;

    if (done) {
      done();
    }
    return col;
  });

  return {col, loaded};
}
