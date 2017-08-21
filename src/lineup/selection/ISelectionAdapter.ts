import {Column, IColumnDesc} from 'lineupjs/src/model';
import {ISelection} from '../../views';
import {IScoreRow} from '../IScore';

export interface ISelectionColumn {
  readonly desc: IColumnDesc;
  readonly data: Promise<IScoreRow<any>[]>;
  readonly id: number;
}

export interface IContext {
  readonly columns: Column[];
  readonly selection: ISelection;

  add(columns: ISelectionColumn[]): void;

  remove(columns: Column[]);

  freeColor(id: number): void;
}


export interface ISelectionAdapter {
  parameterChanged(context: IContext): void;

  selectionChanged(context: IContext): void;
}
