import { Box, Slider, Stack, Text } from '@mantine/core';
import * as React from 'react';
import { useSyncedRef } from '../../hooks';

interface OpacitySliderProps {
  callback: (n: number) => void;
  currentValue: number;
}

export function HexSizeSlider({ callback, currentValue }: OpacitySliderProps) {
  const something = useSyncedRef(callback);

  return (
    <Stack spacing={0} mb={15}>
      <Text weight={500} size={14}>
        Size
      </Text>
      <Box sx={{ width: '200px' }}>
        <Slider
          step={1}
          value={currentValue}
          max={25}
          min={5}
          marks={[
            { value: 10, label: '10' },
            { value: 15, label: '15' },
            { value: 20, label: '20' },
          ]}
          onChange={(n) => {
            something.current?.(n);
          }}
        />
      </Box>
    </Stack>
  );
}
