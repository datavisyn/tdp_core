import { Container, SegmentedControl, Stack, Text } from '@mantine/core';
import * as React from 'react';
import { EViolinOverlay } from '../interfaces';

interface ViolinOverlayProps {
  callback: (s: EViolinOverlay) => void;
  currentSelected: EViolinOverlay;
}

export function ViolinOverlayButtons({ callback, currentSelected }: ViolinOverlayProps) {
  return (
    <Container p={0} fluid sx={{ width: '100%' }}>
      <Stack spacing={0}>
        <Text weight={500} size={14}>
          Overlay
        </Text>
        <SegmentedControl
          value={currentSelected}
          onChange={callback}
          data={[
            { label: EViolinOverlay.NONE, value: EViolinOverlay.NONE },
            { label: EViolinOverlay.BOX, value: EViolinOverlay.BOX },
            { label: EViolinOverlay.STRIP, value: EViolinOverlay.STRIP },
          ]}
        />
      </Stack>
    </Container>
  );
}
