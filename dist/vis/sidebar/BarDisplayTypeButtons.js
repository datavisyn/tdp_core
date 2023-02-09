import { Container, SegmentedControl, Stack } from '@mantine/core';
import * as React from 'react';
import { EBarDisplayType } from '../interfaces';
export function BarDisplayButtons({ callback, currentSelected }) {
    return (React.createElement(Container, { p: 0, fluid: true, sx: { width: '100%' } },
        React.createElement(Stack, { spacing: 0 },
            React.createElement(SegmentedControl, { value: currentSelected, onChange: callback, data: [
                    { label: EBarDisplayType.ABSOLUTE, value: EBarDisplayType.ABSOLUTE },
                    { label: EBarDisplayType.NORMALIZED, value: EBarDisplayType.NORMALIZED },
                ] }))));
}
//# sourceMappingURL=BarDisplayTypeButtons.js.map