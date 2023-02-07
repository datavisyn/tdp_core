import { Container, SegmentedControl, Stack } from '@mantine/core';
import * as React from 'react';
import { EBarGroupingType } from '../interfaces';
export function BarGroupTypeButtons({ callback, currentSelected }) {
    return (React.createElement(Container, { p: 0, fluid: true, sx: { width: '100%' } },
        React.createElement(Stack, { spacing: 0 },
            React.createElement(SegmentedControl, { value: currentSelected, onChange: callback, data: [
                    { label: EBarGroupingType.GROUP, value: EBarGroupingType.GROUP },
                    { label: EBarGroupingType.STACK, value: EBarGroupingType.STACK },
                ] }))));
}
//# sourceMappingURL=BarGroupTypeButtons.js.map