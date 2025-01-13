import { Column, IColumnDesc, IDataProvider } from 'lineupjs';
import { IScoreRow } from '../../base/interfaces';
export interface ILazyLoadedColumn {
    col: Column;
    loaded: Promise<Column>;
    reload: (data: Promise<IScoreRow<any>[]>) => Promise<Column>;
}
export declare class LazyColumn {
    static addLazyColumn(colDesc: any, data: Promise<IScoreRow<any>[]>, provider: IDataProvider & {
        pushDesc(col: IColumnDesc): void;
    }, position: number, done?: () => void): ILazyLoadedColumn;
    private static markLoaded;
}
//# sourceMappingURL=column.d.ts.map