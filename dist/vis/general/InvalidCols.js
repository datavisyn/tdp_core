import * as React from 'react';
import { Alert, Center, Stack } from '@mantine/core';
export function InvalidCols({ headerMessage, bodyMessage }) {
    return (React.createElement(Stack, { style: { height: '100%' } },
        React.createElement(Center, { style: { height: '100%', width: '100%' } },
            React.createElement(Alert, { title: headerMessage, color: "yellow" }, bodyMessage))));
}
//# sourceMappingURL=InvalidCols.js.map