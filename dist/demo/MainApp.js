import { Menu } from '@mantine/core';
import * as React from 'react';
import { LoginUtils } from '../base/LoginUtils';
import { fetchIrisData } from '../vis/stories/Iris.stories';
import { Vis } from '../vis/Vis';
import { VisynHeader } from '../visynApp';
import { VisynApp } from '../visynApp/VisynApp';
import { VisynAppContext } from '../visynApp/VisynAppContext';
const irisData = fetchIrisData();
export function MainApp() {
    const { user } = React.useContext(VisynAppContext);
    return (React.createElement(VisynApp, { header: React.createElement(VisynHeader, { userMenu: user ? (React.createElement(React.Fragment, null,
                React.createElement(Menu.Label, null,
                    "Logged in as ",
                    user.name),
                React.createElement(Menu.Item, { onClick: () => {
                        LoginUtils.logout();
                    } }, "Logout"))) : null, userName: user ? user.name : null, backgroundColor: "dark" }), appShellProps: {} }, user ? React.createElement(Vis, { columns: irisData }) : null));
}
//# sourceMappingURL=MainApp.js.map