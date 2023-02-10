import React from 'react';
import { Menu, Button, Text, createStyles, Flex } from '@mantine/core';
import { VisynHeader } from './VisynHeader';
import { VisynAppContext } from '../VisynAppContext';
import caleydoAsCustomerLogo from '../../assets/caleydo_c.svg';
// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Example/Ui/VisynHeader',
    component: VisynHeader,
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};
const useStyles = createStyles((theme) => ({
    button: {
        color: theme.white,
        backgroundColor: 'transparent',
        '&:hover': {
            backgroundColor: theme.colors.gray[6],
        },
    },
}));
const user = {
    name: 'Jaimy Peters',
    roles: [],
};
const customerLogo = (React.createElement("a", { href: "#" },
    React.createElement("img", { src: caleydoAsCustomerLogo, alt: "customer-logo", style: { height: '24px' } })));
// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
// eslint-disable-next-line react/function-component-definition
const Template = (args) => {
    const visynAppContextValue = React.useMemo(() => ({
        user,
        appName: 'Demo Application',
        clientConfig: {},
    }), []);
    return (React.createElement(VisynAppContext.Provider, { value: visynAppContextValue },
        React.createElement(VisynHeader, { ...args })));
};
// More on args: https://storybook.js.org/docs/react/writing-stories/args
export const Basic = Template.bind({});
Basic.args = {
    appLinkSrc: '#',
    components: {
        aboutAppModal: {
            content: React.createElement(Text, null, "You can add some custom content to this about app modal. It should provide some meaningful description about the application."),
        },
    },
};
export const CustomerLogo = Template.bind({});
CustomerLogo.args = {
    components: {
        beforeRight: customerLogo,
        aboutAppModal: {
            content: React.createElement(Text, null, "You can add some custom content to this about app modal. It should provide some meaningful description about the application."),
            customerLogo,
        },
    },
};
export const ProjectName = Template.bind({});
ProjectName.args = {
    components: {
        afterTitle: (React.createElement(Text, { weight: 500, size: "md", c: "white" }, "Project A")),
        aboutAppModal: {
            content: React.createElement(Text, null, "You can add some custom content to this about app modal. It should provide some meaningful description about the application."),
        },
    },
};
export const BurgerMenu = Template.bind({});
BurgerMenu.args = {
    components: {
        aboutAppModal: {
            content: React.createElement(Text, null, "You can add some custom content to this about app modal. It should provide some meaningful description about the application."),
        },
        burgerMenu: (React.createElement(React.Fragment, null,
            React.createElement(Menu.Item, null, "Page A"),
            React.createElement(Menu.Item, null, "Page B"),
            React.createElement(Menu.Divider, null),
            React.createElement(Menu.Item, null, "Page C"))),
    },
};
function AfterLeft() {
    const { classes } = useStyles();
    return (React.createElement(Flex, { h: 50, gap: 2, justify: "flex-start", align: "center", direction: "row", wrap: "wrap-reverse" },
        React.createElement(Button, { type: "button", className: classes.button }, "First"),
        React.createElement(Button, { type: "button", className: classes.button }, "Second")));
}
export const CustomComponents = Template.bind({});
CustomComponents.args = {
    components: {
        aboutAppModal: {
            content: React.createElement(Text, null, "You can add some custom content to this about app modal. It should provide some meaningful description about the application."),
        },
        afterLeft: React.createElement(AfterLeft, null),
    },
};
export const ExtendedUserMenu = Template.bind({});
ExtendedUserMenu.args = {
    components: {
        aboutAppModal: {
            content: React.createElement(Text, null, "You can add some custom content to this about app modal. It should provide some meaningful description about the application."),
        },
        userMenu: (React.createElement(React.Fragment, null,
            React.createElement(Menu.Item, null, "Page A"),
            React.createElement(Menu.Item, null, "Page B"),
            React.createElement(Menu.Divider, null),
            React.createElement(Menu.Item, null, "Page C"))),
    },
};
//# sourceMappingURL=VisynHeader.stories.js.map