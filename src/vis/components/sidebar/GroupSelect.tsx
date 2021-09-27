import * as React from 'react';
import Select from 'react-select';
import {CategoricalColumn, ColumnInfo, EColumnTypes, NumericalColumn} from '../../types/generalTypes';
import {formatOptionLabel} from '../../utils/sidebarUtils';

interface GroupSelectProps {
    callback: (c: ColumnInfo) => void;
    columns: (NumericalColumn | CategoricalColumn)[];
    currentSelected: ColumnInfo | null;
}

export function GroupSelect(props: GroupSelectProps) {
    return (
        <>
            <label className="pt-2 pb-1">Group</label>
            <Select
                isClearable
                onChange={(e) => props.callback(e)}
                name={'groupSelect'}
                formatOptionLabel={formatOptionLabel}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                options={(props.columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info))}
                value={props.currentSelected ? props.currentSelected : []}
            />
        </>
    );
}
