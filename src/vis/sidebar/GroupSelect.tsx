import * as React from 'react';
import Select from 'react-select';
import { ColumnInfo, EBarDisplayType, EBarGroupingType, EColumnTypes, VisColumn } from '../interfaces';
import { BarDisplayButtons } from './BarDisplayTypeButtons';
import { BarGroupTypeButtons } from './BarGroupTypeButtons';
import { formatOptionLabel } from './utils';

interface GroupSelectProps {
  groupColumnSelectCallback: (c: ColumnInfo) => void;
  groupTypeSelectCallback: (c: EBarGroupingType) => void;
  groupDisplaySelectCallback: (c: EBarDisplayType) => void;
  groupType: EBarGroupingType;
  displayType: EBarDisplayType;
  columns: VisColumn[];
  currentSelected: ColumnInfo | null;
}

export function GroupSelect({
  groupColumnSelectCallback,
  groupTypeSelectCallback,
  groupDisplaySelectCallback,
  groupType,
  displayType,
  columns,
  currentSelected,
}: GroupSelectProps) {
  return (
    <>
      <label className="pt-2 pb-1">Group</label>
      <Select
        isClearable
        onChange={(e) => groupColumnSelectCallback(e)}
        name="groupSelect"
        formatOptionLabel={formatOptionLabel}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.id}
        options={columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info)}
        value={currentSelected || []}
      />
      {currentSelected ? (
        <BarGroupTypeButtons callback={(newGroupType: EBarGroupingType) => groupTypeSelectCallback(newGroupType)} currentSelected={groupType} />
      ) : null}
      {currentSelected && groupType === EBarGroupingType.STACK ? (
        <BarDisplayButtons callback={(display: EBarDisplayType) => groupDisplaySelectCallback(display)} currentSelected={displayType} />
      ) : null}
    </>
  );
}
