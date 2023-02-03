import { Switch } from '@mantine/core';
import * as React from 'react';
export function HexSizeSwitch({ callback, currentValue }) {
    return React.createElement(Switch, { checked: currentValue, onChange: (event) => callback(event.currentTarget.checked), label: "Size scale" });
}
//# sourceMappingURL=HexSizeSwitch.js.map