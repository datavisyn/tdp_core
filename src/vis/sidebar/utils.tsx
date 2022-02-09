import * as React from 'react';
import Highlighter from 'react-highlight-words';
import { CategoricalColumn, ColumnInfo, NumericalColumn } from '../interfaces';

export const formatOptionLabel = (option, ctx) => {
  return (
    <>
      <Highlighter searchWords={[ctx.inputValue]} autoEscape textToHighlight={option.name} />
      {option.description && <span className="small text-muted ms-1">{option.description}</span>}
    </>
  );
};

export function getCol(columns: (NumericalColumn | CategoricalColumn)[], info: ColumnInfo | null): NumericalColumn | CategoricalColumn | null {
  if (!info) {
    return null;
  }
  return columns.filter((c) => c.info.id === info.id)[0];
}
