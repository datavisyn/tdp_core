import { Container, SegmentedControl, Stack, Text } from '@mantine/core';
import * as React from 'react';
import { EViolinOverlay } from '../interfaces';
export function ViolinOverlayButtons({ callback, currentSelected }) {
    return (React.createElement(Container, { p: 0, fluid: true, sx: { width: '100%' } },
        React.createElement(Stack, { spacing: 0 },
            React.createElement(Text, { weight: 500, size: 14 }, "Overlay"),
            React.createElement(SegmentedControl, { value: currentSelected, onChange: callback, data: [
                    { label: EViolinOverlay.NONE, value: EViolinOverlay.NONE },
                    { label: EViolinOverlay.BOX, value: EViolinOverlay.BOX },
                ] }))));
}
//# sourceMappingURL=ViolinOverlayButtons.js.map