import { Container, SegmentedControl, Stack, Text } from '@mantine/core';
import * as React from 'react';
import { EBarDirection } from '../interfaces';
export function BarDirectionButtons({ callback, currentSelected }) {
    return (React.createElement(Container, { p: 0, fluid: true, sx: { width: '100%' } },
        React.createElement(Stack, { spacing: 0 },
            React.createElement(Text, { weight: 500, size: 14 }, "Direction"),
            React.createElement(SegmentedControl, { value: currentSelected, onChange: callback, data: [
                    { label: EBarDirection.VERTICAL, value: EBarDirection.VERTICAL },
                    { label: EBarDirection.HORIZONTAL, value: EBarDirection.HORIZONTAL },
                ] }))));
}
//# sourceMappingURL=BarDirectionButtons.js.map