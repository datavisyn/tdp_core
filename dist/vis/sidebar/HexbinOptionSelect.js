import { Select } from '@mantine/core';
import * as React from 'react';
import { EHexbinOptions } from '../interfaces';
export function HexbinOptionSelect({ callback, currentSelected }) {
    const options = [
        { value: EHexbinOptions.COLOR, label: EHexbinOptions.COLOR },
        { value: EHexbinOptions.BINS, label: EHexbinOptions.BINS },
        { value: EHexbinOptions.PIE, label: EHexbinOptions.PIE },
    ];
    return React.createElement(Select, { label: "Hexbin Options", onChange: (e) => callback(e), data: options, value: currentSelected });
}
//# sourceMappingURL=HexbinOptionSelect.js.map