import { Switch } from '@mantine/core';
import * as React from 'react';
export function HexOpacitySwitch({ callback, currentValue }) {
    return React.createElement(Switch, { checked: currentValue, onChange: (event) => callback(event.currentTarget.checked), label: "Opacity scale" });
}
//# sourceMappingURL=HexOpacitySwitch.js.map