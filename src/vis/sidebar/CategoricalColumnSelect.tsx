import * as React from 'react';
import {useMemo} from 'react';
import Select from 'react-select';
import {VisCategoricalColumn, ColumnInfo, EColumnTypes, VisNumericalColumn} from '../interfaces';
import {formatOptionLabel} from './utils';

interface CategoricalColumnSelectProps {
    callback: (s: ColumnInfo[]) => void;
    columns: VisColumn[];
    currentSelected: ColumnInfo[];
}

export function CategoricalColumnSelect(props: CategoricalColumnSelectProps) {
    const selectCatOptions = useMemo(() => {
        return props.columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info);
    }, [props.columns.length]);

    return (
        <>
            <label className="pt-2 pb-1">Categorical Columns</label>
            <Select
                closeMenuOnSelect={false}
                isMulti
                formatOptionLabel={formatOptionLabel}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                onChange={(e) => props.callback(e.map((c) => c))}
                name="numColumns"
                options={selectCatOptions}
                value={selectCatOptions.filter((c) => props.currentSelected.filter((d) => d.id === c.id).length > 0)}
            />
        </>
    );
}
