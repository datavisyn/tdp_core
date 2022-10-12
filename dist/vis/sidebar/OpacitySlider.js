import { Box, Slider, Stack, Text } from '@mantine/core';
import { debounce } from 'lodash';
import { useMemo } from 'react';
import * as React from 'react';
import { useSyncedRef } from '../../hooks';
export function OpacitySlider({ callback, currentValue }) {
    const syncedCallback = useSyncedRef(callback);
    const debouncedCallback = useMemo(() => {
        return debounce((n) => syncedCallback.current?.(n), 10);
    }, [syncedCallback]);
    return (React.createElement(Stack, { spacing: 0 },
        React.createElement(Text, { weight: 500, size: 14 }, "Opacity"),
        React.createElement(Box, { sx: { width: '200px' } },
            React.createElement(Slider, { step: 0.05, value: currentValue, max: 1, min: 0, marks: [
                    { value: 0.2, label: '20%' },
                    { value: 0.5, label: '50%' },
                    { value: 0.8, label: '80%' },
                ], onChange: (n) => {
                    debouncedCallback(n);
                } }))));
}
//# sourceMappingURL=OpacitySlider.js.map