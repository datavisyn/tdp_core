import { Column } from 'lineupjs';
import { IScore } from '../base/interfaces';
export interface IViewProvider {
    getInstance(): {
        addTrackedScoreColumn(score: IScore<any>): Promise<{
            col: Column;
            loaded: Promise<Column>;
        }>;
        removeTrackedScoreColumn(columnId: string): any;
    };
}
//# sourceMappingURL=IViewProvider.d.ts.map