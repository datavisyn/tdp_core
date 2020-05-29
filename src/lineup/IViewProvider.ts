import {IScore} from "../base/interfaces";
import {Column} from "lineupjs";

export interface IViewProvider {
    getInstance(): {
      addTrackedScoreColumn(score: IScore<any>): Promise<{col: Column, loaded: Promise<Column>}>;
      removeTrackedScoreColumn(columnId: string);
    };
}
