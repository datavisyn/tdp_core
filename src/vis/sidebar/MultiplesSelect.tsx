import * as React from 'react';
import Select from 'react-select';
import {VisCategoricalColumn, ColumnInfo, EColumnTypes, VisNumericalColumn, VisColumn} from '../interfaces';
import {formatOptionLabel} from './utils';

interface MultiplesSelectProps {
    callback: (c: ColumnInfo) => void;
    columns: VisColumn[];
    currentSelected: ColumnInfo | null;
}

export function MultiplesSelect(props: MultiplesSelectProps) {
    return (
        <>
            <label className="pt-2 pb-1">Multiples</label>
            <Select
                isClearable
                onChange={(e) => props.callback(e)}
                name={'multiplesSelect'}
                formatOptionLabel={formatOptionLabel}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                options={(props.columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info))}
                value={props.currentSelected ? props.currentSelected : []}
            />
        </>
    );
}
