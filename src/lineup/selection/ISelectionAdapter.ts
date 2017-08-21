import {Column, IColumnDesc} from 'lineupjs/src/model';
import {ISelection} from '../../views';
import {IScoreRow} from '../IScore';

export interface ISelectionColumn {
  desc: IColumnDesc;
  data: Promise<IScoreRow<any>[]>;
  id: number;
}

export interface IContext {
  columns: Column[];
  selection: ISelection;

  add(columns: ISelectionColumn[]): void;

  remove(columns: Column[]);

  freeColor(id: number): void;
}


export interface ISelectionAdapter {
  parameterChanged(context: IContext): void;

  selectionChanged(context: IContext): void;
}
