import { Avatar, Menu } from '@mantine/core';
import React from 'react';
export function UserAvatar({ menu, userName, color }) {
    return (React.createElement(Menu, { shadow: "md", "data-testid": "visyn-user-avatar" },
        React.createElement(Menu.Target, null,
            React.createElement(Avatar, { role: "button", color: color, radius: "xl" }, userName
                .split(' ')
                .map((name) => name[0])
                .slice(0, 3)
                .join('')
                .toUpperCase())),
        React.createElement(Menu.Dropdown, null, menu)));
}
//# sourceMappingURL=UserAvatar.js.map