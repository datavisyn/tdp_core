import { Container, SegmentedControl, Stack, Text } from '@mantine/core';
import * as React from 'react';
import { EBarDisplayType } from '../interfaces';

interface BarDisplayProps {
  callback: (s: EBarDisplayType) => void;
  currentSelected: EBarDisplayType;
}

export function BarDisplayButtons({ callback, currentSelected }: BarDisplayProps) {
  return (
    <Container p={0} fluid sx={{ width: '100%' }}>
      <Stack spacing={0}>
        <SegmentedControl
          value={currentSelected}
          onChange={callback}
          data={[
            { label: EBarDisplayType.ABSOLUTE, value: EBarDisplayType.ABSOLUTE },
            { label: EBarDisplayType.NORMALIZED, value: EBarDisplayType.NORMALIZED },
          ]}
        />
      </Stack>
    </Container>
  );
}
