import * as React from 'react';
import Select from 'react-select';
import {ENumericalColorScaleType} from '../scatter/utils';
import {CategoricalColumn, ColumnInfo, EColumnTypes, NumericalColumn} from '../interfaces';
import {formatOptionLabel, getCol} from './utils';
import {NumericalColorButtons} from './NumericalColorButtons';

interface ColorSelectProps {
    callback: (c: ColumnInfo) => void;
    numTypeCallback: (c: ENumericalColorScaleType) => void;
    currentNumType: ENumericalColorScaleType;
    columns: (NumericalColumn | CategoricalColumn)[];
    currentSelected: ColumnInfo | null;
}

export function ColorSelect(props: ColorSelectProps) {
    return (
        <>
            <label className="pt-2 pb-1">Color</label>
            <Select
                isClearable
                onChange={(e) => props.callback(e)}
                name={'colorSelect'}
                formatOptionLabel={formatOptionLabel}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                options={(props.columns.map((c) => c.info))}
                value={props.currentSelected ? props.currentSelected : []}
            />
            {props.currentSelected && getCol(props.columns, props.currentSelected).type === EColumnTypes.NUMERICAL
                ? <NumericalColorButtons callback={props.numTypeCallback} currentSelected={props.currentNumType}/>
                : null
            }
        </>
    );
}
