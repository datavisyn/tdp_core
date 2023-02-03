import { Select } from '@mantine/core';
import * as React from 'react';
import { allVisTypes } from '../interfaces';
export function VisTypeSelect({ callback, currentSelected }) {
    return (React.createElement(Select, { label: "Visualization type", 
        // components={{Option: optionLayout}}
        onChange: (e) => callback(e), name: "visTypes", data: allVisTypes.map((t) => {
            return {
                value: t,
                label: t,
            };
        }), value: currentSelected }));
}
//# sourceMappingURL=VisTypeSelect.js.map