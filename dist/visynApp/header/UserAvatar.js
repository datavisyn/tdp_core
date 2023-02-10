import { Avatar, Menu } from '@mantine/core';
import React from 'react';
import { LoginUtils } from '../../base/LoginUtils';
import { useVisynAppContext } from '../VisynAppContext';
import { AboutAppModal } from './AboutAppModal';
export function UserAvatar({ menu, user, color, dvLogo, aboutAppModal, }) {
    const { appName } = useVisynAppContext();
    const [showAboutModal, setShowAboutModal] = React.useState(false);
    return (React.createElement(React.Fragment, null,
        React.createElement(Menu, { shadow: "md", "data-testid": "visyn-user-avatar" },
            React.createElement(Menu.Target, null,
                React.createElement(Avatar, { role: "button", color: color, radius: "xl" }, user
                    .split(' ')
                    .map((name) => name[0])
                    .slice(0, 3)
                    .join('')
                    .toUpperCase())),
            React.createElement(Menu.Dropdown, null,
                React.createElement(React.Fragment, null,
                    React.createElement(Menu.Label, null,
                        "Logged in as ",
                        user),
                    React.createElement(Menu.Divider, null),
                    menu ? (React.createElement(React.Fragment, null,
                        menu,
                        React.createElement(Menu.Divider, null))) : null,
                    React.createElement(Menu.Item, { onClick: () => setShowAboutModal(true) },
                        "About ",
                        appName),
                    React.createElement(Menu.Divider, null),
                    React.createElement(Menu.Item, { onClick: () => {
                            LoginUtils.logout();
                        } }, "Logout")))),
        aboutAppModal && React.isValidElement(aboutAppModal) ? (aboutAppModal) : (React.createElement(AboutAppModal, { opened: showAboutModal, onClose: () => setShowAboutModal(false), dvLogo: dvLogo, customerLogo: aboutAppModal?.customerLogo, content: aboutAppModal?.content, size: aboutAppModal?.size }))));
}
//# sourceMappingURL=UserAvatar.js.map