import { Container, SegmentedControl, Stack } from '@mantine/core';
import * as React from 'react';
import { EBarGroupingType } from '../interfaces';

interface BarGroupTypeProps {
  callback: (s: EBarGroupingType) => void;
  currentSelected: EBarGroupingType;
}

export function BarGroupTypeButtons({ callback, currentSelected }: BarGroupTypeProps) {
  return (
    <Container p={0} fluid sx={{ width: '100%' }}>
      <Stack spacing={0}>
        <SegmentedControl
          value={currentSelected}
          onChange={callback}
          data={[
            { label: EBarGroupingType.GROUP, value: EBarGroupingType.GROUP },
            { label: EBarGroupingType.STACK, value: EBarGroupingType.STACK },
          ]}
        />
      </Stack>
    </Container>
  );
}
