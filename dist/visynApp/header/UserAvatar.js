import { Avatar, createStyles, Menu } from '@mantine/core';
import React from 'react';
const useStyles = createStyles(() => ({
    cursorPointer: {
        cursor: 'pointer',
    },
}));
export function UserAvatar({ menu, userName, color }) {
    const { classes } = useStyles();
    return (React.createElement(Menu, { shadow: "md" },
        React.createElement(Menu.Target, null,
            React.createElement(Avatar, { className: classes.cursorPointer, color: color, radius: "xl" }, userName
                .split(' ')
                .map((name) => name[0])
                .join('')
                .toUpperCase())),
        React.createElement(Menu.Dropdown, null, menu)));
}
//# sourceMappingURL=UserAvatar.js.map