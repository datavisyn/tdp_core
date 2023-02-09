import { Container, SegmentedControl, Stack, Text } from '@mantine/core';
import * as React from 'react';
import { EBarDirection } from '../interfaces';

interface BarDirectionProps {
  callback: (s: EBarDirection) => void;
  currentSelected: EBarDirection;
}

export function BarDirectionButtons({ callback, currentSelected }: BarDirectionProps) {
  return (
    <Container p={0} fluid sx={{ width: '100%' }}>
      <Stack spacing={0}>
        <Text weight={500} size={14}>
          Direction
        </Text>
        <SegmentedControl
          value={currentSelected}
          onChange={callback}
          data={[
            { label: EBarDirection.VERTICAL, value: EBarDirection.VERTICAL },
            { label: EBarDirection.HORIZONTAL, value: EBarDirection.HORIZONTAL },
          ]}
        />
      </Stack>
    </Container>
  );
}
