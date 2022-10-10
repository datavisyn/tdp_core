import { Button, Container, Tooltip } from '@mantine/core';
import * as React from 'react';
import { EFilterOptions } from '../interfaces';
export function FilterButtons({ callback }) {
    return (React.createElement(Container, { p: 0, fluid: true, sx: { width: '100%' } },
        React.createElement(Button.Group, { buttonBorderWidth: 2 },
            React.createElement(Tooltip, { withinPortal: true, label: "Filters any point not currently selected" },
                React.createElement(Button, { sx: { flexGrow: 1 }, p: 0, variant: "light", onClick: () => callback(EFilterOptions.IN) }, EFilterOptions.IN)),
            React.createElement(Tooltip, { withinPortal: true, label: "Filters all currently selected points" },
                React.createElement(Button, { sx: { flexGrow: 1 }, p: 0, variant: "light", onClick: () => callback(EFilterOptions.OUT) }, EFilterOptions.OUT)),
            React.createElement(Tooltip, { withinPortal: true, label: "Removes any existing filter" },
                React.createElement(Button, { sx: { flexGrow: 1 }, p: 0, variant: "light", onClick: () => callback(EFilterOptions.CLEAR) }, EFilterOptions.CLEAR)))));
}
//# sourceMappingURL=FilterButtons.js.map