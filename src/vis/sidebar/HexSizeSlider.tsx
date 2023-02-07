import { Box, Slider, Stack, Text } from '@mantine/core';
import { debounce } from 'lodash';
import * as React from 'react';
import { useMemo } from 'react';
import { useSyncedRef } from '../../hooks';

interface OpacitySliderProps {
  callback: (n: number) => void;
  currentValue: number;
}

export function HexSizeSlider({ callback, currentValue }: OpacitySliderProps) {
  const syncedCallback = useSyncedRef(callback);

  const debouncedCallback = useMemo(() => {
    return debounce((n: number) => syncedCallback.current?.(n), 10);
  }, [syncedCallback]);

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
            debouncedCallback(n);
          }}
        />
      </Box>
    </Stack>
  );
}
