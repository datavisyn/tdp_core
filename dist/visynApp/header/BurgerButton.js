import { Burger, Menu } from '@mantine/core';
import React from 'react';
export function BurgerButton({ menu }) {
    return (React.createElement(Menu, { shadow: "md" },
        React.createElement(Menu.Target, null,
            React.createElement(Burger, { opened: false, color: "white" })),
        React.createElement(Menu.Dropdown, { m: 10 }, menu)));
}
//# sourceMappingURL=BurgerButton.js.map