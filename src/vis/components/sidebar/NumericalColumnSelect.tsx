import * as React from 'react';
import {useMemo} from 'react';
import Select from 'react-select';
import {CategoricalColumn, ColumnInfo, EColumnTypes, NumericalColumn} from '../../types/generalTypes';
import {formatOptionLabel} from '../../utils/sidebarUtils';

interface NumericalColumnSelectProps {
    callback: (s: ColumnInfo[]) => void;
    columns: (NumericalColumn | CategoricalColumn)[];
    currentSelected: ColumnInfo[];
}

export function NumericalColumnSelect(props: NumericalColumnSelectProps) {
    const selectNumOptions = useMemo(() => {
        return props.columns.filter((c) => c.type === EColumnTypes.NUMERICAL).map((c) => c.info);
    }, [props.columns.length]);

    return (
        <>
            <label className="pt-2 pb-1">Numerical Columns</label>
            <Select
                closeMenuOnSelect={false}
                isMulti
                formatOptionLabel={formatOptionLabel}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                onChange={(e) => props.callback(e.map((c) => c))}
                name="numColumns"
                options={selectNumOptions}
                value={selectNumOptions.filter((c) => props.currentSelected.filter((d) => d.id === c.id).length > 0)}
            />
        </>
    );
}
