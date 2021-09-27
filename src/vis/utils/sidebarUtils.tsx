import * as React from 'react';
import Highlighter from 'react-highlight-words';
import {ColumnInfo, NumericalColumn, CategoricalColumn} from '../types/generalTypes';

export const formatOptionLabel = (option, ctx) => {
    return (
        <>
            <Highlighter
                searchWords={[ctx.inputValue]}
                autoEscape={true}
                textToHighlight={option.name}
            />
            {option.description &&
                <span className="small text-muted ms-1">{option.description}</span>}
        </>
    );
};

export function getCol(columns: (NumericalColumn | CategoricalColumn)[], info: ColumnInfo | null): NumericalColumn | CategoricalColumn | null {
    if(!info) { return null; }
    return columns.filter((c) => c.info.id === info.id)[0];
}
