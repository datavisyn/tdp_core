import { Select } from '@mantine/core';
import * as React from 'react';
import { I18nextManager } from '../../i18n/I18nextManager';
import { EHexbinOptions } from '../interfaces';
export function HexbinOptionSelect({ callback, currentSelected }) {
    const options = [
        { value: EHexbinOptions.COLOR, label: EHexbinOptions.COLOR },
        { value: EHexbinOptions.BINS, label: EHexbinOptions.BINS },
        { value: EHexbinOptions.PIE, label: EHexbinOptions.PIE },
    ];
    return (React.createElement(Select, { label: I18nextManager.getInstance().i18n.t('tdp:core.vis.hexbinOptions'), onChange: (e) => callback(e), data: options, value: currentSelected }));
}
//# sourceMappingURL=HexbinOptionSelect.js.map