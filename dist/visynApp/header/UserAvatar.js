import { Avatar, Menu } from '@mantine/core';
import React from 'react';
import { LoginUtils } from '../../base/LoginUtils';
export function UserAvatar({ menu, user, color }) {
    return (React.createElement(Menu, { shadow: "md", "data-testid": "visyn-user-avatar" },
        React.createElement(Menu.Target, null,
            React.createElement(Avatar, { role: "button", color: color, radius: "xl" }, user
                .split(' ')
                .map((name) => name[0])
                .slice(0, 3)
                .join('')
                .toUpperCase())),
        React.createElement(Menu.Dropdown, null, menu || (React.createElement(React.Fragment, null,
            React.createElement(Menu.Label, null,
                "Logged in as ",
                user),
            React.createElement(Menu.Item, { onClick: () => {
                    LoginUtils.logout();
                } }, "Logout"))))));
}
//# sourceMappingURL=UserAvatar.js.map