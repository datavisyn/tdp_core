import * as React from 'react';
import Select from 'react-select';
import { EHexbinOptions } from '../interfaces';
import { formatOptionLabel } from './utils';
export function HexbinOptionSelect({ callback, currentSelected }) {
    const options = [
        { id: EHexbinOptions.BAR, name: EHexbinOptions.BAR },
        { id: EHexbinOptions.COLOR, name: EHexbinOptions.COLOR },
        { id: EHexbinOptions.LYINGPATHS, name: EHexbinOptions.LYINGPATHS },
        { id: EHexbinOptions.PIE, name: EHexbinOptions.PIE },
    ];
    return (React.createElement(React.Fragment, null,
        React.createElement("label", { className: "pt-2 pb-1" }, "Hexbin Options"),
        React.createElement(Select, { onChange: (e) => callback(e.id), name: "hexbinOptionSelect", formatOptionLabel: formatOptionLabel, getOptionLabel: (option) => option.id, getOptionValue: (option) => option.name, options: options, value: { id: currentSelected, name: currentSelected } })));
}
//# sourceMappingURL=HexbinOptionSelect.js.map