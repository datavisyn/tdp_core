import { Select, Stack } from '@mantine/core';
import * as React from 'react';
import { ColumnInfo, EBarDisplayType, EBarGroupingType, EColumnTypes, VisColumn } from '../interfaces';
import { BarDisplayButtons } from './BarDisplayTypeButtons';
import { BarGroupTypeButtons } from './BarGroupTypeButtons';

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
    <Stack spacing="sm">
      <Select
        clearable
        placeholder="Select Column"
        label="Group"
        onChange={(e) => groupColumnSelectCallback(columns.find((c) => c.info.id === e)?.info)}
        data={columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => ({ value: c.info.id, label: c.info.name }))}
        value={currentSelected?.id}
      />
      {currentSelected ? (
        <BarGroupTypeButtons callback={(newGroupType: EBarGroupingType) => groupTypeSelectCallback(newGroupType)} currentSelected={groupType} />
      ) : null}
      {currentSelected && groupType === EBarGroupingType.STACK ? (
        <BarDisplayButtons callback={(display: EBarDisplayType) => groupDisplaySelectCallback(display)} currentSelected={displayType} />
      ) : null}
    </Stack>
  );
}
