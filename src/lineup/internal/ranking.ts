import {Column, Ranking, LocalDataProvider} from 'lineupjs';

export interface IRankingWrapper {
  sortBy(column: string, asc?: boolean): boolean;

  groupBy(column: string, aggregate?: boolean): boolean;

  findColumn<T extends Column>(column: string): T | null;
}

export function wrapRanking(data: LocalDataProvider, ranking: Ranking) {
  const findColumn = (column: string) => ranking.find((d) => (<any>d.desc).column === column || d.desc.label === column);
  return <IRankingWrapper> {
    findColumn,
    sortBy: (column: string, asc = true) => {
      const col = findColumn(column);
      if (!col) {
        return false;
      }
      ranking.setSortCriteria({col, asc});
      return true;
    },
    groupBy: (column: string, aggregate = false) => {
      const col = findColumn(column);
      if (!col) {
        return false;
      }
      ranking.setGroupCriteria([col]);
      if (aggregate) {
        ranking.on(`${Ranking.EVENT_GROUPS_CHANGED}.aggregateswitch`, () => {
          data.aggregateAllOf(ranking, true);
          ranking.on(`${Ranking.EVENT_GROUPS_CHANGED}.aggregateswitch`, null);
        });
      }
      return true;
    }
  };
}
