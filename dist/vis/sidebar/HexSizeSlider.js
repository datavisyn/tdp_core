import { Box, Slider, Stack, Text } from '@mantine/core';
import * as React from 'react';
import { useSyncedRef } from '../../hooks';
export function HexSizeSlider({ callback, currentValue }) {
    const something = useSyncedRef(callback);
    return (React.createElement(Stack, { spacing: 0, mb: 15 },
        React.createElement(Text, { weight: 500, size: 14 }, "Size"),
        React.createElement(Box, { sx: { width: '200px' } },
            React.createElement(Slider, { step: 1, value: currentValue, max: 25, min: 5, marks: [
                    { value: 10, label: '10' },
                    { value: 15, label: '15' },
                    { value: 20, label: '20' },
                ], onChange: (n) => {
                    something.current?.(n);
                } }))));
}
//# sourceMappingURL=HexSizeSlider.js.map