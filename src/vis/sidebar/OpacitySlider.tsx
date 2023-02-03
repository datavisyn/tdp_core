import { Box, Slider, Stack, Text } from '@mantine/core';
import { debounce } from 'lodash';
import { useMemo } from 'react';

import * as React from 'react';
import { useSyncedRef } from '../../hooks';

interface OpacitySliderProps {
  callback: (n: number) => void;
  currentValue: number;
}

export function OpacitySlider({ callback, currentValue }: OpacitySliderProps) {
  const syncedCallback = useSyncedRef(callback);

  const debouncedCallback = useMemo(() => {
    return debounce((n: number) => syncedCallback.current?.(n), 10);
  }, [syncedCallback]);

  return (
    <Stack spacing={0}>
      <Text weight={500} size={14}>
        Opacity
      </Text>
      <Box sx={{ width: '200px' }}>
        <Slider
          step={0.05}
          value={+currentValue.toFixed(2)}
          max={1}
          min={0}
          marks={[
            { value: 0.2, label: '20%' },
            { value: 0.5, label: '50%' },
            { value: 0.8, label: '80%' },
          ]}
          onChange={(n) => {
            debouncedCallback(n);
          }}
        />
      </Box>
    </Stack>
  );
}
